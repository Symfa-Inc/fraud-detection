# Fraud Detection: EDA and Model Training Report

This report summarizes the exploratory data analysis (EDA) and model training pipeline for the insurance claim fraud detection system, based on `data_eda.ipynb` and `autogluon_train.ipynb`.

---

## 1. Data Source

- **File**: `backend/data/source.csv`
- **Original size**: 19,000 rows
- **Columns**: 25 (24 features + 1 target)

### Schema

| Column | Description |
|--------|-------------|
| claim_number | Claim identifier |
| age_of_driver | Driver age |
| gender | M/F |
| marital_status | 0/1 |
| safty_rating | Safety rating (0–100) |
| annual_income | Annual income |
| high_education_ind | High education flag (0/1) |
| address_change_ind | Address change flag (0/1) |
| living_status | Own/Rent |
| zip_code | Zip code |
| claim_date | Claim date |
| claim_day_of_week | Day of week |
| accident_site | Local, Parking Lot, Highway |
| past_num_of_claims | Number of past claims |
| witness_present_ind | Witness present (0/1) |
| liab_prct | Liability percent |
| channel | Broker, Phone, Online |
| policy_report_filed_ind | Policy report filed (0/1) |
| claim_est_payout | Claim estimated payout |
| age_of_vehicle | Vehicle age |
| vehicle_category | Compact, Large, Medium |
| vehicle_price | Vehicle price |
| vehicle_color | Vehicle color |
| vehicle_weight | Vehicle weight |
| **fraud** | **Target (0/1)** |

---

## 2. Exploratory Data Analysis (data_eda.ipynb)

### 2.1 Data Cleaning

- **Missing values**:
  - `witness_present_ind`: 143
  - `claim_est_payout`: 23
  - `age_of_vehicle`: 7
  - `marital_status`: 4
- **Action**: Rows with any missing values were dropped.
- **Result**: Clean dataframe with no missing values.

### 2.2 Class Imbalance

| fraud | Count |
|-------|-------|
| 0 | 16,062 |
| 1 | 2,938 |

The dataset is imbalanced (~84% non-fraud, ~16% fraud).

### 2.3 Balancing Strategy

- **Method**: Upsampling of fraud=1 rows via bootstrap (numeric) and categorical distribution sampling.
- **Result**:
  - fraud=0: 15,907
  - fraud=1: 15,907
  - Total: 31,814 rows (balanced)

### 2.4 Train/Test Split

- **Ratio**: 80% train / 20% test
- **Stratification**: Yes (by `fraud`)
- **Random state**: 42

| Split | Rows | fraud=0 | fraud=1 |
|-------|------|---------|---------|
| Train | 25,451 | 12,725 | 12,726 |
| Test | 6,363 | 3,182 | 3,181 |

### 2.5 Feature Selection

Only the top 10 features (by SHAP importance) are used:

- annual_income
- age_of_driver
- claim_day_of_week
- high_education_ind
- past_num_of_claims
- safty_rating
- witness_present_ind
- gender
- claim_est_payout
- living_status

### 2.6 Outputs

| File | Description |
|------|-------------|
| `data/full_balanced.parquet` | Balanced dataset |
| `data/train.parquet` | Training set (10 features + fraud) |
| `data/test.parquet` | Test set (10 features + fraud) |

---

## 3. Model Training (autogluon_train.ipynb)

### 3.1 Framework

- **Tool**: AutoGluon TabularPredictor
- **Task**: Binary classification (fraud vs. non-fraud)
- **Label column**: `fraud`
- **Metric**: Accuracy

### 3.2 Configuration

- **Model path**: `backend/models/AutogluonModels/reduced`
- **Features**: 10 (see above)
- **Data**: `train.parquet` (25,451 rows × 11 columns)
- **Validation**: Auto holdout (≈10%)

### 3.3 Models Trained

AutoGluon trains an ensemble. Main models:

| Model | Validation Accuracy |
|-------|---------------------|
| WeightedEnsemble_L2 (best) | 89.96% |
| NeuralNetTorch | 89.56% |
| CatBoost | 88.96% |
| XGBoost | 88.92% |
| NeuralNetFastAI | 88.36% |
| LightGBM | 88.32% |
| LightGBMLarge | 88.28% |
| LightGBMXT | 84.00% |
| RandomForestGini | 83.88% |
| RandomForestEntr | 83.36% |
| ExtraTreesGini | 77.92% |
| ExtraTreesEntr | 77.72% |

### 3.4 Training Summary

- **Best model**: WeightedEnsemble_L2
- **Validation accuracy**: 89.96%
- **Total training time**: ~125 s
- **Inference throughput**: ~58,095 rows/s (batch size 2500)

### 3.5 Test Set Evaluation

| Metric | Value |
|--------|-------|
| Accuracy | 88.87% |
| Balanced accuracy | 88.87% |
| MCC (Matthews Correlation Coefficient) | 0.79 |

---

## 4. Feature Importance (SHAP)

Based on `feature_importance_shap.json` (10-feature model):

| Rank | Feature | Normalized Importance |
|------|---------|----------------------|
| 1 | Annual income | 1.00 |
| 2 | Age of driver | 0.91 |
| 3 | Claim day of week | 0.61 |
| 4 | High education | 0.18 |
| 5 | Past number of claims | 0.14 |
| 6 | Safety rating | 0.12 |
| 7 | Witness present | 0.12 |
| 8 | Gender | 0.11 |
| 9 | Claim estimated payout | 0.10 |
| 10 | Living status | 0.10 |

---

## 5. Pipeline Overview

```
source.csv
    → Clean (dropna)
    → Balance (upsample fraud=1)
    → full_balanced.parquet
    → Stratified 80/20 split
    → Filter to 10 features
    → train.parquet, test.parquet
    → AutoGluon TabularPredictor
    → reduced model
    → SHAP importance
    → feature_importance_shap.json
```

---

## 6. Reproducibility

To regenerate the data and model:

1. Run `data_eda.ipynb` to produce `train.parquet` and `test.parquet`.
2. Run `autogluon_train.ipynb` to train the model in `reduced`.
3. Run `backend/scripts/shap_importance.py` to update SHAP feature importance.
