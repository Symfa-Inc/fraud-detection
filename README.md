<div align="center">

<img src=".assets/logo.png" width="100" alt="Fraud Detection Logo">

# 🕵️ Insurance Claim Fraud Detection

[![Python 3.13](https://img.shields.io/badge/Python-3.13-blue.svg)](https://www.python.org/downloads/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178c6.svg)](https://www.typescriptlang.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.128-009688.svg)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black.svg)](https://nextjs.org/)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-1.6-F7931E.svg?logo=scikit-learn&logoColor=white)](https://scikit-learn.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg)](https://www.docker.com/)

**Machine learning prototype for detecting fraudulent insurance claims.**

🔗 **Live Demo**: [fraud-detection-demo.symfa.com](https://fraud-detection-demo-placeholder.vercel.app/)

</div>

## 📋 Overview

A machine learning prototype for detecting fraudulent insurance claims, based on the [2023 Travelers NESS Statathon Kaggle Competition](https://www.kaggle.com/competitions/2023-travelers-ness-statathon/overview). This project aims to develop a robust fraud detection system for insurance claims using machine learning techniques. Fraudulent claims cost the insurance industry billions of dollars annually, making accurate detection crucial for maintaining affordable premiums and operational efficiency.

## 🎯 Problem Statement

The goal is to build a predictive model that can identify potentially fraudulent insurance claims based on various claim and policyholder characteristics. This binary classification task helps insurance companies:

- Reduce financial losses from fraudulent claims
- Streamline the claims investigation process
- Allocate investigation resources more efficiently

## 📁 Project Structure

```
fraud-detection/
├── backend/                        # 🐍 Python Backend (UV workspace member)
│   ├── src/fraud_detection/        # FastAPI application
│   │   ├── __init__.py
│   │   └── main.py                 # API endpoints
│   ├── models/                     # Trained ML model artifacts
│   ├── notebooks/                  # Jupyter notebooks (EDA, experiments)
│   ├── scripts/                    # Training & preprocessing scripts
│   ├── data/                       # Datasets
│   │   └── source.csv
│   └── pyproject.toml              # Backend dependencies
│
├── frontend/                       # ⚛️ Next.js Frontend
│   ├── src/app/
│   │   ├── layout.js
│   │   ├── page.js
│   │   └── globals.css
│   └── package.json
│
├── pyproject.toml                  # UV workspace definition
├── uv.lock                         # Lockfile
├── .pre-commit-config.yaml         # Code quality hooks
└── README.md
```


## 📊 Dataset

The dataset contains insurance claim records with the following features:

### Driver Demographics
| Feature | Description |
|---------|-------------|
| `age_of_driver` | Age of the driver |
| `gender` | Gender of the driver (M/F) |
| `marital_status` | Marital status indicator |
| `annual_income` | Annual income of the policyholder |
| `high_education_ind` | Higher education indicator |
| `living_status` | Living status (Own/Rent) |
| `zip_code` | ZIP code of the policyholder |

### Claim Information
| Feature | Description |
|---------|-------------|
| `claim_number` | Unique claim identifier |
| `claim_date` | Date of the claim |
| `claim_day_of_week` | Day of the week when claim was filed |
| `accident_site` | Location type of the accident |
| `past_num_of_claims` | Number of past claims |
| `witness_present_ind` | Whether a witness was present |
| `liab_prct` | Liability percentage |
| `channel` | Claim submission channel |
| `policy_report_filed_ind` | Whether a policy report was filed |
| `claim_est_payout` | Estimated claim payout amount |

### Vehicle Information
| Feature | Description |
|---------|-------------|
| `age_of_vehicle` | Age of the vehicle |
| `vehicle_category` | Category of the vehicle |
| `vehicle_price` | Price of the vehicle |
| `vehicle_color` | Color of the vehicle |
| `vehicle_weight` | Weight of the vehicle |
| `safty_rating` | Safety rating of the vehicle |

### Target Variable
| Feature | Description |
|---------|-------------|
| `fraud` | **Target** (1 = Fraudulent, 0 = Legitimate) |

## 🛠️ Tech Stack

### Backend
- **Python 3.13+**
- **FastAPI** - Modern, high-performance web framework
- **Pydantic** - Data validation
- **uvicorn** - ASGI server

### Frontend
- **Next.js 16** - React framework with SSR
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS 4** - Utility-first CSS framework
- **React 19**

### ML & Data Science
- **pandas** - Data manipulation
- **scikit-learn** - Machine learning (planned)

### Development
- **uv** - Fast Python package manager
- **pre-commit** - Git hooks for code quality
- **ruff** - Linter and formatter
- **mypy** - Static type checker

## 🚀 Getting Started

### Prerequisites

- Python 3.13+
- Node.js 18+
- [pnpm](https://pnpm.io/) (fast and efficient Node.js package manager)
- [uv](https://github.com/astral-sh/uv) (recommended for Python)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Symfa-Inc/fraud-detection.git
   cd fraud-detection
   ```

2. **Install Python dependencies:**
   ```bash
   uv sync
   ```

3. **Install frontend dependencies:**
   ```bash
   cd frontend
   pnpm install
   ```

### Running the Application

**Backend (FastAPI):**
```bash
uv run uvicorn fraud_detection.main:app --reload
```
API will be available at: http://localhost:8000
API docs at: http://localhost:8000/docs

**Frontend (Next.js):**
```bash
cd frontend
pnpm dev
```
Frontend will be available at: http://localhost:3000

## 🔗 References

- [2023 Travelers NESS Statathon on Kaggle](https://www.kaggle.com/competitions/2023-travelers-ness-statathon/overview)
- [Travelers Insurance](https://www.travelers.com/)
