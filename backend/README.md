# 🐍 Fraud Detection Backend

FastAPI backend for the Insurance Claim Fraud Detection system.

## 📁 Structure

```
backend/
├── Dockerfile              # Container configuration
├── src/fraud_detection/    # Python package (API code)
│   ├── __init__.py
│   └── main.py             # FastAPI application
├── models/                 # Trained ML model artifacts
├── notebooks/              # Jupyter notebooks (EDA, experiments)
├── scripts/                # Training & preprocessing scripts
├── data/                   # Datasets
└── pyproject.toml          # Package dependencies
```

## 🚀 Quick Start

```bash
# From project root
uv sync                     # Install dependencies

# Run the API
uv run uvicorn fraud_detection.main:app --reload --port 8000
```

- API: http://localhost:8000
- Docs: http://localhost:8000/docs

## 🐳 Docker

```bash
# From backend/ directory
docker build -t fraud-detection-backend .
docker run -p 8000:8000 fraud-detection-backend
```

## 📦 Package Management

```bash
# Add a dependency
uv add <package> --package fraud-detection

# Add a dev dependency
uv add <package> --package fraud-detection --dev

# Remove a dependency
uv remove <package> --package fraud-detection
```

## 🧪 Development

```bash
# Run tests
uv run pytest

# Type checking
uv run mypy src/

# Linting & formatting
uv run ruff check src/
uv run ruff format src/
```

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API info |
| GET | `/health` | Health check |
| POST | `/predict` | Predict fraud probability |
