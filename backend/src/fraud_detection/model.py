"""Load AutoGluon predictor and run fraud predictions."""

from datetime import date
from pathlib import Path

import pandas as pd

MODEL_DIR = (
    Path(__file__).resolve().parent.parent.parent
    / "models"
    / "AutogluonModels"
    / "ag-20260211_121715"
)
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
    """Convert PredictionRequest to a row dict matching training schema."""
    return {
        "claim_number": 0,
        "age_of_driver": request.age_of_driver,
        "gender": request.gender,
        "marital_status": request.marital_status,
        "safty_rating": request.safty_rating,
        "annual_income": request.annual_income,
        "high_education_ind": int(request.high_education_ind),
        "address_change_ind": int(request.address_change_ind),
        "living_status": request.living_status,
        "zip_code": request.zip_code,
        "claim_date": f"{date.today().month}/{date.today().day}/{date.today().year}",
        "claim_day_of_week": request.claim_day_of_week,
        "accident_site": request.accident_site,
        "past_num_of_claims": request.past_num_of_claims,
        "witness_present_ind": float(request.witness_present_ind),
        "liab_prct": request.liab_prct,
        "channel": request.channel,
        "policy_report_filed_ind": int(request.policy_report_filed_ind),
        "claim_est_payout": request.claim_est_payout,
        "age_of_vehicle": request.age_of_vehicle,
        "vehicle_category": request.vehicle_category,
        "vehicle_price": request.vehicle_price,
        "vehicle_color": request.vehicle_color,
        "vehicle_weight": request.vehicle_weight,
    }


def predict_fraud(predictor, request) -> tuple[float, bool]:
    """Run model prediction and return (fraud_probability, is_fraud)."""
    row = request_to_row(request)
    df = pd.DataFrame([row])
    proba = float(predictor.predict_proba(df).iloc[0, 1])
    is_fraud = proba >= THRESHOLD
    return proba, is_fraud
