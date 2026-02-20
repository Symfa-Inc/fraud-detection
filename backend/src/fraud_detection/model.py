"""Load AutoGluon predictor and run fraud predictions."""

import pandas as pd

from fraud_detection.config import MODEL_DIR

THRESHOLD = 0.65

_predictor = None


def load_predictor():
    """Load the AutoGluon TabularPredictor from backend/models/ (cached)."""
    global _predictor
    if _predictor is None:
        from autogluon.tabular import TabularPredictor

        _predictor = TabularPredictor.load(str(MODEL_DIR))
    return _predictor


def request_to_row(request) -> dict:
    """Convert PredictionRequest to a row dict matching training schema (10 frontend features)."""
    return {
        "annual_income": request.annual_income,
        "age_of_driver": request.age_of_driver,
        "claim_day_of_week": request.claim_day_of_week,
        "high_education_ind": str(request.high_education_ind),
        "past_num_of_claims": request.past_num_of_claims,
        "safty_rating": request.safty_rating,
        "witness_present_ind": str(request.witness_present_ind),
        "gender": request.gender,
        "claim_est_payout": request.claim_est_payout,
        "living_status": request.living_status,
    }


def predict_fraud(predictor, request) -> tuple[float, bool]:
    """Run model prediction and return (fraud_probability, is_fraud)."""
    row = request_to_row(request)
    df = pd.DataFrame([row])
    proba = float(predictor.predict_proba(df).iloc[0, 1])
    is_fraud = proba >= THRESHOLD
    return proba, is_fraud
