# 🕵️ Insurance Claim Fraud Detection

A machine learning prototype for detecting fraudulent insurance claims, based on the [2023 Travelers NESS Statathon Kaggle Competition](https://www.kaggle.com/competitions/2023-travelers-ness-statathon/overview).

## 📋 Overview

This project aims to develop a robust fraud detection system for insurance claims using machine learning techniques. Fraudulent claims cost the insurance industry billions of dollars annually, making accurate detection crucial for maintaining affordable premiums and operational efficiency.

## 🎯 Problem Statement

The goal is to build a predictive model that can identify potentially fraudulent insurance claims based on various claim and policyholder characteristics. This binary classification task helps insurance companies:

- Reduce financial losses from fraudulent claims
- Streamline the claims investigation process
- Allocate investigation resources more efficiently

## 📊 Dataset

The dataset contains insurance claim records with the following features:

### Driver Demographics
| Feature | Description |
|---------|-------------|
| `age_of_driver` | Age of the driver |
| `gender` | Gender of the driver |
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

### Other Features
| Feature | Description |
|---------|-------------|
| `address_change_ind` | Address change indicator |
| `fraud` | **Target variable** (1 = Fraudulent, 0 = Legitimate) |

## 🛠️ Tech Stack

- **Python 3.13+**
- **pandas** - Data manipulation and analysis
- **openpyxl** - Excel file handling

## 🚀 Getting Started

### Prerequisites

Make sure you have Python 3.13+ installed. We recommend using [uv](https://github.com/astral-sh/uv) for dependency management.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Symfa-Inc/fraud-detection.git
   cd fraud-detection
   ```

2. Install dependencies using uv:
   ```bash
   uv sync
   ```

3. Activate the virtual environment:
   ```bash
   source .venv/bin/activate
   ```
