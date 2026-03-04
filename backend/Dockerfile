FROM python:3.13-slim AS base

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Build tools needed by statsforecast (C++ extensions)
RUN apt-get update && apt-get install -y --no-install-recommends g++ && rm -rf /var/lib/apt/lists/*

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Install dependencies (cached layer)
COPY pyproject.toml ./
RUN uv sync --no-dev --no-install-project

# Copy application code
COPY src/ src/
COPY models/neuralnet/ models/neuralnet/
COPY data/feature_importance_shap.json data/train.parquet ./data/

# Install the project itself
RUN uv sync --no-dev

# Config uses env vars for paths when running from installed package
ENV MODEL_DIR=/app/models/neuralnet/
ENV FEATURE_IMPORTANCE_PATH=/app/data/feature_importance_shap.json
ENV TRAIN_DATA_PATH=/app/data/train.parquet
# OpenAI (pass OPENAI_API_KEY at runtime for LLM summaries; OPENAI_SUMMARY_MODEL optional)
ENV OPENAI_SUMMARY_MODEL=gpt-4o-mini

EXPOSE 8000

CMD ["uv", "run", "uvicorn", "fraud_detection.main:app", "--host", "0.0.0.0", "--port", "8000"]
