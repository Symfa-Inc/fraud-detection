"""FastAPI application - minimal entry point."""

import json

from fastapi import FastAPI
from pydantic import BaseModel
from starlette.middleware.cors import CORSMiddleware

from fraud_detection.config import FEATURE_IMPORTANCE_PATH
from fraud_detection.model import load_predictor, predict_fraud
from fraud_detection.summarizer import generate_summary

app = FastAPI(
    title="Fraud Detection API",
    description="Insurance Claim Fraud Detection API",
    version="0.1.0",
)

# CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Schemas ---


class PredictionRequest(BaseModel):
    """Prediction request schema - 10 features used by the Claim Features panel."""

    annual_income: int
    age_of_driver: int
    claim_day_of_week: str
    high_education_ind: str
    past_num_of_claims: int
    safty_rating: int
    witness_present_ind: str
    gender: str
    claim_est_payout: float
    living_status: str


class PredictionResponse(BaseModel):
    """Prediction response schema."""

    fraud_probability: float
    is_fraud: bool
    summary: str


# --- Endpoints ---
@app.get("/")
async def root() -> dict[str, str]:
    """Root endpoint."""
    return {"message": "Fraud Detection API", "docs": "/docs"}


@app.get("/feature-importance")
async def feature_importance() -> list[dict[str, str | float]]:
    """Return top 10 features by SHAP importance. Run scripts/shap_importance.py first."""
    if not FEATURE_IMPORTANCE_PATH.exists():
        return []
    return json.loads(FEATURE_IMPORTANCE_PATH.read_text())


@app.post("/predict", response_model=PredictionResponse)
async def predict(request: PredictionRequest) -> PredictionResponse:
    """Predict fraud for a claim using the trained model."""
    predictor = load_predictor()
    proba, is_fraud = predict_fraud(predictor, request)
    features = request.model_dump()
    summary = generate_summary(proba, is_fraud, features)
    return PredictionResponse(
        fraud_probability=proba,
        is_fraud=is_fraud,
        summary=summary,
    )
