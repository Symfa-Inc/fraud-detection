"""
Compute top 10 most impactful features for fraud detection using SHAP.
Run from project root: uv run python backend/scripts/shap_importance.py
"""

import json
import sys
from pathlib import Path

import numpy as np
import pandas as pd
import shap

# Ensure backend src is on path for config import
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "src"))
from risk_profiler.config import FEATURE_IMPORTANCE_PATH, MODEL_DIR, TRAIN_DATA_PATH

# Map column names to display labels (match frontend)
FEATURE_LABELS = {
    "age_of_driver": "Age of driver",
    "gender": "Gender",
    "marital_status": "Marital status",
    "safty_rating": "Safety rating",
    "annual_income": "Annual income",
    "high_education_ind": "High education",
    "address_change_ind": "Address change",
    "living_status": "Living status",
    "zip_code": "Zip code",
    "claim_date": "Claim date",
    "claim_day_of_week": "Claim day of week",
    "accident_site": "Accident site",
    "past_num_of_claims": "Past number of claims",
    "witness_present_ind": "Witness present",
    "liab_prct": "Liability percent",
    "channel": "Channel",
    "policy_report_filed_ind": "Policy report filed",
    "claim_est_payout": "Claim estimated payout",
    "age_of_vehicle": "Age of vehicle",
    "vehicle_category": "Vehicle category",
    "vehicle_price": "Vehicle price",
    "vehicle_color": "Vehicle color",
    "vehicle_weight": "Vehicle weight",
}

# Paths (from config, OUTPUT_PATH same as FEATURE_IMPORTANCE_PATH)
OUTPUT_PATH = FEATURE_IMPORTANCE_PATH


def main() -> None:
    from autogluon.tabular import TabularPredictor

    print("Loading predictor...")
    predictor = TabularPredictor.load(str(MODEL_DIR))

    print("Loading data...")
    df = pd.read_parquet(TRAIN_DATA_PATH)
    X = df.drop(columns=["fraud"])
    # Use a small sample for KernelExplainer (faster)
    X_sample = X.sample(n=min(200, len(X)), random_state=42)

    def predict_proba_fn(data):
        if not isinstance(data, pd.DataFrame):
            data = pd.DataFrame(data, columns=X_sample.columns)
        return predictor.predict_proba(data).values

    background = X_sample.sample(n=min(50, len(X_sample)), random_state=42)
    print("Computing SHAP values (this may take a few minutes)...")
    explainer = shap.KernelExplainer(predict_proba_fn, background)
    shap_values = explainer.shap_values(X_sample, nsamples=100)
    # For binary: shap_values is list [class_0, class_1], use fraud class (1)
    sv = shap_values[1] if isinstance(shap_values, list) else shap_values
    # Flatten to 2D (n_samples, n_features) if needed
    if sv.ndim == 3:
        sv = sv[:, :, 1]
    mean_abs = np.abs(sv).mean(axis=0)
    if mean_abs.ndim > 1:
        mean_abs = mean_abs.mean(axis=tuple(range(1, mean_abs.ndim)))

    # Mean absolute SHAP per feature
    importance = pd.DataFrame(
        {"feature": X_sample.columns, "importance": mean_abs},
    ).sort_values("importance", ascending=False)

    # Exclude claim_date (not editable in UI), take top 10 from the rest
    importance_no_date = importance[importance["feature"] != "claim_date"]
    top10 = importance_no_date.head(10)
    top10_normalized = top10.copy()
    top10_normalized["importance"] = (
        top10_normalized["importance"] / top10_normalized["importance"].max()
    )

    result = [
        {
            "name": FEATURE_LABELS.get(row.feature, row.feature),
            "value": round(row.importance, 4),
        }
        for _, row in top10_normalized.iterrows()
    ]

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text(json.dumps(result, indent=2))

    print("\nTop 10 features by SHAP importance:")
    for i, row in enumerate(top10.itertuples(), 1):
        print(f"  {i}. {row.feature}: {row.importance:.4f}")
    print(f"\nSaved to {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
