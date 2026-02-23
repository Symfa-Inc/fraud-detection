import axios from "axios";

// Create an instance of axios with the base URL
const api = axios.create({
    baseURL: "http://localhost:8000",
});

export type PredictionRequest = {
  annual_income: number;
  age_of_driver: number;
  claim_day_of_week: string;
  high_education_ind: string;
  past_num_of_claims: number;
  safty_rating: number;
  witness_present_ind: string;
  gender: string;
  claim_est_payout: number;
  living_status: string;
};

export type FeatureContribution = {
  name: string;
  value: string;
  impact: number;
};

export type PredictionResponse = {
  fraud_probability: number;
  is_fraud: boolean;
  summary: string;
  feature_contributions?: FeatureContribution[];
  shap_base_value?: number;
};

export const predict = async (
  payload: PredictionRequest
): Promise<PredictionResponse> => {
  const { data } = await api.post<PredictionResponse>("/predict", payload);
  return data;
};

export type FeatureImportanceItem = { name: string; value: number };

export const getFeatureImportance = async (): Promise<
  FeatureImportanceItem[]
> => {
  const { data } = await api.get<FeatureImportanceItem[]>(
    "/feature-importance"
  );
  return Array.isArray(data) ? data : [];
};

// Export the Axios instance
export default api;
