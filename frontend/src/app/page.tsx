"use client";

import { useEffect, useState } from "react";
import {
  getFeatureImportance,
  logBackendRoot,
  predict,
  type PredictionRequest,
} from "./utils/api";

import FeatureImportance from "./ui/FeatureImportance";
import FeaturePanel, { Feature } from "./ui/FeaturePanel";
import StatusSummary from "./ui/StatusSummary";
import SummaryPanel from "./ui/SummaryPanel";

// Top 10 by SHAP importance (claim_date excluded, then next feature included)
const TOP_FEATURE_IDS = [
  "annual_income",
  "age_of_driver",
  "claim_day_of_week",
  "high_education_ind",
  "past_num_of_claims",
  "safty_rating",
  "witness_present_ind",
  "gender",
  "claim_est_payout",
  "living_status",
] as const;

const allFeatures: Feature[] = [
  {
    id: "age_of_driver",
    label: "Age of driver",
    type: "number",
    defaultValue: 45,
    min: 18,
    max: 90,
    step: 1,
  },
  {
    id: "gender",
    label: "Gender",
    type: "select",
    options: ["F", "M"],
    defaultValue: "M",
  },
  {
    id: "marital_status",
    label: "Marital status",
    type: "number",
    defaultValue: 1,
    min: 0,
    max: 1,
    step: 1,
  },
  {
    id: "safty_rating",
    label: "Safety rating",
    type: "number",
    defaultValue: 75,
    min: 0,
    max: 100,
    step: 1,
  },
  {
    id: "annual_income",
    label: "Annual income",
    type: "number",
    defaultValue: 38000,
    min: 25000,
    max: 60000,
    step: 1000,
  },
  {
    id: "high_education_ind",
    label: "High education",
    type: "select",
    options: ["0", "1"],
    defaultValue: "1",
  },
  {
    id: "address_change_ind",
    label: "Address change",
    type: "select",
    options: ["0", "1"],
    defaultValue: "0",
  },
  {
    id: "living_status",
    label: "Living status",
    type: "select",
    options: ["Own", "Rent"],
    defaultValue: "Own",
  },
  {
    id: "zip_code",
    label: "Zip code",
    type: "number",
    defaultValue: 50051,
    min: 10000,
    max: 99999,
    step: 1,
  },
  {
    id: "claim_day_of_week",
    label: "Claim day of week",
    type: "select",
    options: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
    defaultValue: "Monday",
  },
  {
    id: "accident_site",
    label: "Accident site",
    type: "select",
    options: ["Local", "Parking Lot", "Highway"],
    defaultValue: "Local",
  },
  {
    id: "past_num_of_claims",
    label: "Past number of claims",
    type: "number",
    defaultValue: 0,
    min: 0,
    max: 20,
    step: 1,
  },
  {
    id: "witness_present_ind",
    label: "Witness present",
    type: "select",
    options: ["0", "1"],
    defaultValue: "0",
  },
  {
    id: "liab_prct",
    label: "Liability percent",
    type: "number",
    defaultValue: 50,
    min: 0,
    max: 100,
    step: 1,
  },
  {
    id: "channel",
    label: "Channel",
    type: "select",
    options: ["Broker", "Phone", "Online"],
    defaultValue: "Broker",
  },
  {
    id: "policy_report_filed_ind",
    label: "Policy report filed",
    type: "select",
    options: ["0", "1"],
    defaultValue: "0",
  },
  {
    id: "claim_est_payout",
    label: "Claim estimated payout",
    type: "number",
    defaultValue: 5000,
    min: 0,
    max: 20000,
    step: 100,
  },
  {
    id: "age_of_vehicle",
    label: "Age of vehicle",
    type: "number",
    defaultValue: 5,
    min: 0,
    max: 15,
    step: 1,
  },
  {
    id: "vehicle_category",
    label: "Vehicle category",
    type: "select",
    options: ["Compact", "Large", "Medium"],
    defaultValue: "Large",
  },
  {
    id: "vehicle_price",
    label: "Vehicle price",
    type: "number",
    defaultValue: 20000,
    min: 5000,
    max: 60000,
    step: 500,
  },
  {
    id: "vehicle_color",
    label: "Vehicle color",
    type: "select",
    options: ["black", "blue", "gray", "other", "red", "silver", "white"],
    defaultValue: "black",
  },
  {
    id: "vehicle_weight",
    label: "Vehicle weight",
    type: "number",
    defaultValue: 20000,
    min: 5000,
    max: 65000,
    step: 500,
  },
];

const featuresOrdered = TOP_FEATURE_IDS.flatMap((id) =>
  allFeatures.filter((f) => f.id === id)
);

const DEFAULT_VALUES: Record<string, string | number> = {};
allFeatures.forEach((f) => {
  DEFAULT_VALUES[f.id] = f.defaultValue;
});

// Fallback when /feature-importance API not available (matches reduced model SHAP)
const DEFAULT_FEATURE_IMPORTANCE = [
  { name: "Annual income", value: 1 },
  { name: "Age of driver", value: 0.91 },
  { name: "Claim day of week", value: 0.61 },
  { name: "High education", value: 0.18 },
  { name: "Past number of claims", value: 0.14 },
  { name: "Safety rating", value: 0.12 },
  { name: "Witness present", value: 0.12 },
  { name: "Gender", value: 0.11 },
  { name: "Claim estimated payout", value: 0.1 },
  { name: "Living status", value: 0.1 },
];

const clamp = (value: number, min = 0, max = 1) =>
  Math.min(Math.max(value, min), max);

const getNumberValue = (value: string | number) => {
  if (value === "") {
    return 0;
  }
  return Number(value);
};

const threshold = 0.65;

function buildPayload(
  featureValues: Record<string, string | number>
): PredictionRequest {
  const merged = { ...DEFAULT_VALUES, ...featureValues };
  const num = (id: string) => getNumberValue(merged[id] ?? 0);
  const str = (id: string) => String(merged[id] ?? "");
  return {
    annual_income: num("annual_income"),
    age_of_driver: num("age_of_driver"),
    claim_day_of_week: str("claim_day_of_week"),
    high_education_ind: str("high_education_ind"),
    past_num_of_claims: num("past_num_of_claims"),
    safty_rating: num("safty_rating"),
    witness_present_ind: str("witness_present_ind"),
    gender: str("gender"),
    claim_est_payout: num("claim_est_payout"),
    living_status: str("living_status"),
  };
}

export default function Home() {
  useEffect(() => {
    logBackendRoot();
  }, []);

  useEffect(() => {
    getFeatureImportance().then((data) => {
      if (data.length > 0) {
        setFeatureImportance(data);
      }
    });
  }, []);

  const [featureValues, setFeatureValues] = useState(() => ({
    ...DEFAULT_VALUES,
  }));

  const [prediction, setPrediction] = useState<{
    riskScore: number;
    status: string;
    summary: string;
  } | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [featureImportance, setFeatureImportance] = useState(
    DEFAULT_FEATURE_IMPORTANCE
  );

  const updateFeatureValue = (id: string, value: string | number) => {
    setFeatureValues((prev) => ({ ...prev, [id]: value }));
    setPrediction(null);
  };

  const handleEvaluate = async () => {
    setIsEvaluating(true);
    setError(null);
    try {
      const payload = buildPayload(featureValues);
      const res = await predict(payload);
      const riskScore = res.fraud_probability;
      const status = res.is_fraud ? "Status: Fraud Likely" : "Status: Low Risk";
      setPrediction({ riskScore, status, summary: res.summary });
    } catch (err) {
      setError("Prediction failed. Is the backend running?");
      setPrediction(null);
    } finally {
      setIsEvaluating(false);
    }
  };

  const riskScore = prediction?.riskScore ?? 0;
  const status = prediction?.status ?? "Status: Not yet evaluated";
  const summary =
    prediction?.summary ??
    "Adjust the claim features and click Evaluate to run the fraud prediction model.";

  const isLowRisk = riskScore < threshold;
  const backgroundImage =
    prediction === null
      ? "radial-gradient(circle at top left, rgba(148, 163, 184, 0.25), transparent 45%), radial-gradient(circle at 30% 20%, rgba(226, 232, 240, 0.8), transparent 55%), radial-gradient(circle at 90% 10%, rgba(199, 210, 254, 0.35), transparent 45%)"
      : isLowRisk
        ? "radial-gradient(circle at top left, rgba(16, 185, 129, 0.18), transparent 45%), radial-gradient(circle at 30% 20%, rgba(167, 243, 208, 0.5), transparent 55%), radial-gradient(circle at 90% 10%, rgba(209, 250, 229, 0.6), transparent 45%)"
        : "radial-gradient(circle at top left, rgba(248, 113, 113, 0.2), transparent 45%), radial-gradient(circle at 30% 20%, rgba(254, 202, 202, 0.55), transparent 55%), radial-gradient(circle at 90% 10%, rgba(253, 164, 175, 0.45), transparent 45%)";

  return (
    <div
      className="min-h-screen bg-slate-50 text-slate-900"
      style={{ backgroundImage }}
    >
      <div className="mx-auto flex min-h-screen w-full max-w-[85rem] flex-col gap-8 px-8 py-10 md:flex-row">
        <FeaturePanel
          features={featuresOrdered}
          featureValues={featureValues}
          onFeatureChange={updateFeatureValue}
          onEvaluate={handleEvaluate}
          isEvaluating={isEvaluating}
        />

        <main className="min-w-0 flex-1">
          <div className="space-y-8 md:sticky md:top-8 md:self-start">
            {error && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-6 py-4 text-sm text-rose-700">
                {error}
              </div>
            )}
            <StatusSummary
              status={status}
              score={riskScore}
              threshold={threshold}
            />

            <SummaryPanel summary={summary} />

            <FeatureImportance items={featureImportance} />
          </div>
        </main>
      </div>
    </div>
  );
}
