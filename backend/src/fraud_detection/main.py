"""FastAPI application - minimal entry point."""

from fastapi import FastAPI
from pydantic import BaseModel
from starlette.middleware.cors import CORSMiddleware

from fraud_detection.model import load_predictor, predict_fraud

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
    """Prediction request schema - all features from the Claim Features panel."""

    age_of_driver: int
    gender: str
    marital_status: int
    safty_rating: int
    annual_income: int
    high_education_ind: str
    address_change_ind: str
    living_status: str
    zip_code: int
    claim_day_of_week: str
    accident_site: str
    past_num_of_claims: int
    witness_present_ind: str
    liab_prct: int
    channel: str
    policy_report_filed_ind: str
    claim_est_payout: float
    age_of_vehicle: float
    vehicle_category: str
    vehicle_price: float
    vehicle_color: str
    vehicle_weight: float


class PredictionResponse(BaseModel):
    """Prediction response schema."""

    fraud_probability: float
    is_fraud: bool


# --- Endpoints ---
@app.get("/")
async def root() -> dict[str, str]:
    """Root endpoint."""
    return {"message": "Fraud Detection API", "docs": "/docs"}


@app.post("/predict", response_model=PredictionResponse)
async def predict(request: PredictionRequest) -> PredictionResponse:
    """Predict fraud for a claim using the trained model."""
    predictor = load_predictor()
    proba, is_fraud = predict_fraud(predictor, request)
    return PredictionResponse(
        fraud_probability=proba,
        is_fraud=is_fraud,
    )
