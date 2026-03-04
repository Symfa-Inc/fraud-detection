"""Per-instance SHAP explanations for fraud predictions."""

import pandas as pd

from risk_profiler.config import MODEL_DIR, TRAIN_DATA_PATH

FEATURE_LABELS = {
    "age_of_driver": "Age of driver",
    "gender": "Gender",
    "safty_rating": "Safety rating",
    "annual_income": "Annual income",
    "high_education_ind": "High education",
    "living_status": "Living status",
    "claim_day_of_week": "Claim day of week",
    "past_num_of_claims": "Past number of claims",
    "witness_present_ind": "Witness present",
    "claim_est_payout": "Claim estimated payout",
}

FEATURE_ORDER = [
    "annual_income",
    "age_of_driver",
    "claim_day_of_week",
    "high_education_ind",
    "past_num_of_claims",
    "safty_rating",
    "witness_present_ind",
    "gender",
    "claim_est_payout",
    "living_status",
]

_explainer = None
_predictor = None


def _get_explainer():
    """Create and cache the KernelExplainer (lazy init)."""
    global _explainer, _predictor
    if _explainer is None:
        import shap
        from autogluon.tabular import TabularPredictor

        _predictor = TabularPredictor.load(str(MODEL_DIR))
        df = pd.read_parquet(TRAIN_DATA_PATH)
        X = df.drop(columns=["fraud"])[FEATURE_ORDER]
        background = X.sample(n=min(25, len(X)), random_state=42)

        def predict_fraud_only(data):
            """Return only P(fraud) so SHAP explains a single output. Ensures base + sum(impacts) = risk_score."""
            if not isinstance(data, pd.DataFrame):
                data = pd.DataFrame(data, columns=FEATURE_ORDER)
            probs = _predictor.predict_proba(data)
            return probs.iloc[:, 1].values.reshape(-1, 1)

        _explainer = shap.KernelExplainer(predict_fraud_only, background)
    return _explainer


def compute_contributions(
    row: dict[str, str | int | float],
) -> tuple[list[dict], float]:
    """
    Compute per-instance SHAP contributions for a single prediction row.
    Returns (contributions, base_value) where base_value + sum(impacts) = risk score.
    Impact: positive = pushes towards fraud, negative = pushes towards low risk.
    """
    import numpy as np

    df_row = pd.DataFrame([row])[FEATURE_ORDER]
    explainer = _get_explainer()
    shap_values = explainer.shap_values(df_row, nsamples=100)

    # Single-output: expected_value is scalar (avg P(fraud)), shap_values is (1, n_features)
    ev = explainer.expected_value
    base_value = float(np.asarray(ev).flat[0])
    sv = shap_values[0] if isinstance(shap_values, list) else shap_values
    sv_flat = np.ravel(sv)[: len(FEATURE_ORDER)]

    result = []
    for i, feat in enumerate(FEATURE_ORDER):
        val = row.get(feat, "")
        impact_val = sv_flat[i]
        impact_scalar = float(np.asarray(impact_val).flat[0])
        result.append(
            {
                "name": FEATURE_LABELS.get(feat, feat),
                "value": str(val),
                "impact": round(impact_scalar, 4),
            },
        )

    # Sort by absolute impact: most influential features first (either direction)
    result.sort(key=lambda x: -abs(x["impact"]))  # type: ignore
    return result, base_value
