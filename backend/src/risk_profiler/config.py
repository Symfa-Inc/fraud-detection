"""Load .env and expose configuration."""

import os
from pathlib import Path

from dotenv import load_dotenv

# Backend root (backend/)
_BACKEND_ROOT = Path(__file__).resolve().parent.parent.parent
load_dotenv(_BACKEND_ROOT / ".env")


def _resolve_path(env_key: str, default: str) -> Path:
    p = Path(os.environ.get(env_key, default))
    return (_BACKEND_ROOT / p) if not p.is_absolute() else p


MODEL_DIR = _resolve_path("MODEL_DIR", "models/neuralnet/")
FEATURE_IMPORTANCE_PATH = _resolve_path(
    "FEATURE_IMPORTANCE_PATH",
    "data/feature_importance_shap.json",
)
TRAIN_DATA_PATH = _resolve_path("TRAIN_DATA_PATH", "data/train.parquet")
TEST_DATA_PATH = _resolve_path("TEST_DATA_PATH", "data/test.parquet")

# OpenAI model for summary generation (e.g. gpt-4o-mini, gpt-4o)
OPENAI_SUMMARY_MODEL = os.environ.get("OPENAI_SUMMARY_MODEL", "gpt-4o-mini")


def _load_frontend_origins() -> list[str]:
    raw = os.environ.get("FRONTEND_ORIGINS")
    if raw:
        return [origin.strip() for origin in raw.split(",") if origin.strip()]

    default_origins = [
        "http://localhost:3000",
        "https://risk-profiler.ai.symfa.com",
    ]
    frontend_url = os.environ.get("FRONTEND_URL")
    if frontend_url and frontend_url not in default_origins:
        default_origins.append(frontend_url)
    return default_origins


FRONTEND_ORIGINS = _load_frontend_origins()
