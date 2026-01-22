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
class HealthResponse(BaseModel):
    status: str


class PredictionRequest(BaseModel):
    claim_number: int


class PredictionResponse(BaseModel):
    claim_number: int
    fraud_probability: float
    is_fraud: bool


# --- Endpoints ---
@app.get("/")
async def root():
    """Root endpoint."""
    return {"message": "Fraud Detection API", "docs": "/docs"}


@app.get("/health", response_model=HealthResponse)
async def health():
    """Health check."""
    return HealthResponse(status="healthy")


@app.post("/predict", response_model=PredictionResponse)
async def predict(request: PredictionRequest):
    """Predict fraud for a claim."""
    # TODO: Implement ML model prediction
    return PredictionResponse(
        claim_number=request.claim_number,
        fraud_probability=0.0,
        is_fraud=False,
    )
