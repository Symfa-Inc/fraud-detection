import axios from "axios";

// Create an instance of axios with the base URL
const api = axios.create({
    baseURL: "http://localhost:8000",
});

export const logBackendRoot = async () => {
  try {
    const response = await api.get("/");
    console.log("Backend root response:", response.data);
  } catch (error) {
    console.error("Failed to fetch backend root:", error);
  }
};

export type PredictionRequest = {
  age_of_driver: number;
  gender: string;
  marital_status: number;
  safty_rating: number;
  annual_income: number;
  high_education_ind: string;
  address_change_ind: string;
  living_status: string;
  zip_code: number;
  claim_day_of_week: string;
  accident_site: string;
  past_num_of_claims: number;
  witness_present_ind: string;
  liab_prct: number;
  channel: string;
  policy_report_filed_ind: string;
  claim_est_payout: number;
  age_of_vehicle: number;
  vehicle_category: string;
  vehicle_price: number;
  vehicle_color: string;
  vehicle_weight: number;
};

export type PredictionResponse = {
  fraud_probability: number;
  is_fraud: boolean;
};

export const predict = async (
  payload: PredictionRequest
): Promise<PredictionResponse> => {
  const { data } = await api.post<PredictionResponse>("/predict", payload);
  return data;
};

// Export the Axios instance
export default api;
