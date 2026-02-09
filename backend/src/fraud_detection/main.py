"""FastAPI application - minimal entry point."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

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
    """Prediction request schema."""

    claim_number: int


class PredictionResponse(BaseModel):
    """Prediction response schema."""

    claim_number: int
    fraud_probability: float
    is_fraud: bool


# --- Endpoints ---
@app.get("/")
async def root() -> dict[str, str]:
    """Root endpoint."""
    return {"message": "Fraud Detection API", "docs": "/docs"}


@app.post("/predict", response_model=PredictionResponse)
async def predict(request: PredictionRequest) -> PredictionResponse:
    """Predict fraud for a claim."""
    # TODO: Implement ML model prediction
    return PredictionResponse(
        claim_number=request.claim_number,
        fraud_probability=0.0,
        is_fraud=False,
    )
