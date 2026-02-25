FROM python:3.13-slim

# Prevent Python from writing pyc files and enable unbuffered logging
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

# Install build dependencies (AutoGluon/scikit-learn may need some)
RUN apt-get update && apt-get install -y --no-install-recommends \
        build-essential \
        curl \
        libfreetype6 \
        libjpeg62-turbo \
        libpng-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy only files needed for production (build context = backend/)
COPY pyproject.toml ./
COPY src ./src
COPY models/neuralnet ./models/neuralnet
COPY data/feature_importance_shap.json data/train.parquet ./data/

# Install Python dependencies
RUN pip install --upgrade pip setuptools wheel \
    && pip install "uv>=0.4.20" \
    && uv pip install --system .

# Config uses env vars for paths when running from installed package
ENV MODEL_DIR=/app/models/neuralnet/
ENV FEATURE_IMPORTANCE_PATH=/app/data/feature_importance_shap.json
ENV TRAIN_DATA_PATH=/app/data/train.parquet

EXPOSE 8000
CMD ["uvicorn", "fraud_detection.main:app", "--host", "0.0.0.0", "--port", "8000"]
