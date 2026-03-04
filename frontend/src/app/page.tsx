"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  getFeatureImportance,
  predict,
  type PredictionRequest,
} from "./utils/api";

import FeatureImportance from "./ui/FeatureImportance";
import FeaturePanel, { type Feature } from "./ui/FeaturePanel";
import StatusSummary from "./ui/StatusSummary";
import SummaryPanel from "./ui/SummaryPanel";

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
    id: "annual_income",
    label: "Annual income",
    type: "number",
    defaultValue: 38000,
    min: 25000,
    max: 60000,
    step: 1000,
  },
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
    id: "claim_day_of_week",
    label: "Claim day of week",
    type: "select",
    options: [
      { label: "Monday", value: "Monday" },
      { label: "Tuesday", value: "Tuesday" },
      { label: "Wednesday", value: "Wednesday" },
      { label: "Thursday", value: "Thursday" },
      { label: "Friday", value: "Friday" },
      { label: "Saturday", value: "Saturday" },
      { label: "Sunday", value: "Sunday" },
    ],
    defaultValue: "Monday",
  },
  {
    id: "high_education_ind",
    label: "Higher education",
    type: "select",
    options: [
      { label: "No", value: "0" },
      { label: "Yes", value: "1" },
    ],
    defaultValue: "1",
  },
  {
    id: "past_num_of_claims",
    label: "Past claims",
    type: "number",
    defaultValue: 0,
    min: 0,
    max: 20,
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
    id: "witness_present_ind",
    label: "Witness present",
    type: "select",
    options: [
      { label: "No", value: "0" },
      { label: "Yes", value: "1" },
    ],
    defaultValue: "0",
  },
  {
    id: "gender",
    label: "Driver gender",
    type: "select",
    options: [
      { label: "Female", value: "F" },
      { label: "Male", value: "M" },
    ],
    defaultValue: "M",
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
    id: "living_status",
    label: "Living status",
    type: "select",
    options: [
      { label: "Own", value: "Own" },
      { label: "Rent", value: "Rent" },
    ],
    defaultValue: "Own",
  },
];

const featuresOrdered = TOP_FEATURE_IDS.flatMap((id) =>
  allFeatures.filter((feature) => feature.id === id),
);

const DEFAULT_VALUES: Record<string, string | number> = Object.fromEntries(
  allFeatures.map((feature) => [feature.id, feature.defaultValue]),
);

const DEFAULT_FEATURE_IMPORTANCE = [
  { name: "Annual income", value: 1 },
  { name: "Age of driver", value: 0.91 },
  { name: "Claim day of week", value: 0.61 },
  { name: "Higher education", value: 0.18 },
  { name: "Past claims", value: 0.14 },
  { name: "Safety rating", value: 0.12 },
  { name: "Witness present", value: 0.12 },
  { name: "Driver gender", value: 0.11 },
  { name: "Claim estimated payout", value: 0.1 },
  { name: "Living status", value: 0.1 },
];

const threshold = 0.65;

type PredictionState = {
  riskScore: number;
  status: string;
  summary: string;
  featureContributions: { name: string; value: string; impact: number }[];
  shapBaseValue: number;
};

const getNumberValue = (value: string | number) => {
  if (value === "") {
    return 0;
  }
  return Number(value);
};

function buildPayload(
  featureValues: Record<string, string | number>,
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

function InfoTooltip({ label, text }: { label: string; text: string }) {
  return (
    <button type="button" className="effects-info" aria-label={label}>
      <svg
        className="effects-info-icon"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M10 2a8 8 0 100 16 8 8 0 000-16zm.75 4.75a.75.75 0 10-1.5 0v.5a.75.75 0 001.5 0v-.5zm0 3.5a.75.75 0 00-1.5 0v3a.75.75 0 001.5 0v-3z"
          clipRule="evenodd"
        />
      </svg>
      <span className="effects-tooltip">{text}</span>
    </button>
  );
}

export default function Home() {
  const [featureValues, setFeatureValues] = useState(() => ({
    ...DEFAULT_VALUES,
  }));
  const [prediction, setPrediction] = useState<PredictionState | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [featureImportance, setFeatureImportance] = useState(
    DEFAULT_FEATURE_IMPORTANCE,
  );
  const [resultKey, setResultKey] = useState(0);
  const lastEvaluatedPayloadRef = useRef<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    getFeatureImportance()
      .then((data) => {
        if (isMounted && data.length > 0) {
          setFeatureImportance(data);
        }
      })
      .catch(() => {
        // Keep fallback values when endpoint is unavailable.
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const currentPayloadKey = useMemo(
    () => JSON.stringify(buildPayload(featureValues)),
    [featureValues],
  );

  const canEvaluate = lastEvaluatedPayloadRef.current !== currentPayloadKey;

  const updateFeatureValue = (id: string, value: string | number) => {
    setFeatureValues((prev) => ({ ...prev, [id]: value }));
    setPrediction(null);
    setError(null);
  };

  const resetInputs = () => {
    setFeatureValues({ ...DEFAULT_VALUES });
    setPrediction(null);
    setError(null);
    lastEvaluatedPayloadRef.current = null;
  };

  const handleEvaluate = async () => {
    if (!canEvaluate) {
      return;
    }

    const payload = buildPayload(featureValues);
    const payloadKey = JSON.stringify(payload);

    setIsEvaluating(true);
    setError(null);

    try {
      const response = await predict(payload);
      lastEvaluatedPayloadRef.current = payloadKey;
      const status = response.is_fraud ? "Fraud likely" : "Low risk";
      setPrediction({
        riskScore: response.fraud_probability,
        status,
        summary: response.summary,
        featureContributions: response.feature_contributions ?? [],
        shapBaseValue: response.shap_base_value ?? 0,
      });
      setResultKey((key) => key + 1);
    } catch {
      setError(
        "Prediction failed. Confirm the backend is running on http://localhost:8000 and try again.",
      );
      setPrediction(null);
    } finally {
      setIsEvaluating(false);
    }
  };

  const riskScore = prediction?.riskScore ?? 0;
  const status = prediction?.status ?? "Awaiting evaluation";
  const summary =
    prediction?.summary ??
    "Set claim inputs and run evaluation to see risk level and feature-level explanation.";

  return (
    <main className="page-shell">
      <header className="site-header">
        <span className="header-tag">Insurance · Risk Profiler</span>
        <h1>RiskProfiler</h1>
        <p className="header-sub">
          Evaluate insurance claim fraud risk using machine learning and
          explainable AI. Review feature-level insights to understand what
          drives the predicted fraud probability.
        </p>
      </header>

      <div className="content-grid">
        <FeaturePanel
          features={featuresOrdered}
          featureValues={featureValues}
          onFeatureChange={updateFeatureValue}
          onEvaluate={handleEvaluate}
          onReset={resetInputs}
          canEvaluate={canEvaluate}
          hasPrediction={prediction !== null}
          isEvaluating={isEvaluating}
        />

        <div className="result-panel" aria-live="polite">
          <div className="result-heading">
            <span className="result-heading-main">
              Risk Assessment
              <InfoTooltip
                label="About Risk Assessment"
                text="Risk Assessment shows the model's fraud probability for the current claim profile. Scores above the threshold indicate likely fraud."
              />
            </span>
          </div>

          {error && (
            <div className="error-bar" role="alert">
              {error}
            </div>
          )}

          {prediction ? (
            <div key={resultKey} className="result-entrance">
              <StatusSummary
                status={status}
                score={riskScore}
                threshold={threshold}
                isEvaluated
                isEvaluating={false}
              />

              <FeatureImportance
                items={featureImportance}
                contributions={prediction.featureContributions}
                baseValue={prediction.shapBaseValue}
                riskScore={prediction.riskScore}
                isEvaluated
                maxItems={6}
              />
            </div>
          ) : (
            <div className="result-empty">
              <div className="pulse-ring" />
              <span>Enter claim data and run evaluation</span>
            </div>
          )}
        </div>
      </div>

      {prediction && (
        <SummaryPanel
          summary={summary}
          isEvaluated
          riskScore={prediction.riskScore}
          contributions={prediction.featureContributions}
          globalItems={featureImportance}
        />
      )}
    </main>
  );
}
