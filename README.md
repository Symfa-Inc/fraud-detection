<div align="center">

<img src=".assets/logo.png" width="100" alt="Risk Profiler Logo">

# Insurance Claim Risk Profiler

Machine learning prototype for profiling risk in insurance claims using AutoGluon and SHAP explainability.

**[Live Demo](https://risk-profiler.symfa.ai/)** · **[GitHub](https://github.com/Symfa-Inc/risk-profiler)** · **[Confluence](https://symfa.atlassian.net/wiki/spaces/SYMFA/pages/5012094988)**

</div>

## Preview

<div align="center">
<img src=".assets/risk-profiler.png" width="800" alt="Risk Profiler Preview">
</div>

## Tech Stack

| Category | Technologies |
|----------|-------------|
| Backend | Python 3.13, FastAPI, Uvicorn |
| Frontend | TypeScript, Next.js, React, Tailwind CSS |
| AI/ML | AutoGluon, scikit-learn, SHAP, OpenAI |
| Data | pandas, NumPy, Pydantic |
| Package Management | uv (backend), pnpm (frontend) |
| Deployment | Docker, GitHub Actions, Google Artifact Registry |

## Getting Started

### Prerequisites

- Python 3.13+ / [uv](https://docs.astral.sh/uv/)
- Node.js 24+ / [pnpm](https://pnpm.io/)

### Installation & Running

```bash
# Backend
cd backend
cp .env.example .env          # Add your OpenAI API key
uv sync
uv run uvicorn risk_profiler.main:app --reload

# Frontend (in a separate terminal)
cd frontend
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) (frontend) and [http://localhost:8000/docs](http://localhost:8000/docs) (API docs).

## License

[MIT](LICENSE)
