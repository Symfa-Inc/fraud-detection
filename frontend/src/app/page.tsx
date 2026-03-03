"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  getFeatureImportance,
  predict,
  type PredictionRequest,
} from "./utils/api";

import FeatureImportance from "./ui/FeatureImportance";
import FeaturePanel, { Feature } from "./ui/FeaturePanel";
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
  allFeatures.filter((feature) => feature.id === id)
);

const DEFAULT_VALUES: Record<string, string | number> = Object.fromEntries(
  allFeatures.map((feature) => [feature.id, feature.defaultValue])
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
  const [featureValues, setFeatureValues] = useState(() => ({
    ...DEFAULT_VALUES,
  }));
  const [prediction, setPrediction] = useState<PredictionState | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [featureImportance, setFeatureImportance] = useState(
    DEFAULT_FEATURE_IMPORTANCE
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
    [featureValues]
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
        "Prediction failed. Confirm the backend is running on http://localhost:8000 and try again."
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
    <div className="min-h-screen">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>

      <main className="mx-auto w-full max-w-7xl px-5 py-8 md:px-8 md:py-10">
        <header className="surface-card p-6 md:p-7">
          <p className="kicker">Fraud Detection</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 md:text-4xl">
            Fraud Signal Navigator
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-zinc-500 md:text-base">
            Light, minimal claim-scoring workspace with many parameters and a
            compact decision panel.
          </p>
          <div className="mt-4 h-px bg-zinc-200" />
        </header>

        <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:items-start">
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

          <aside
            id="main-content"
            className="min-w-0 space-y-5 xl:sticky xl:top-6"
            aria-live="polite"
          >
            {error && (
              <div
                role="alert"
                className="surface-card border-red-200 bg-red-50 px-4 py-3"
              >
                <p className="text-sm font-medium text-red-700">{error}</p>
              </div>
            )}

            <div
              key={prediction ? resultKey : "initial"}
              className={prediction ? "result-entrance" : ""}
            >
              <StatusSummary
                status={status}
                score={riskScore}
                threshold={threshold}
                isEvaluated={prediction !== null}
                isEvaluating={isEvaluating}
              />
            </div>

            <FeatureImportance
              items={featureImportance}
              contributions={prediction?.featureContributions}
              baseValue={prediction?.shapBaseValue}
              riskScore={prediction?.riskScore}
              isEvaluated={prediction !== null}
              compact
              maxItems={6}
            />
          </aside>
        </section>

        <section className="mt-6">
          <SummaryPanel
            summary={summary}
            isEvaluated={prediction !== null}
            riskScore={prediction?.riskScore}
            contributions={prediction?.featureContributions}
            globalItems={featureImportance}
          />
        </section>
      </main>
    </div>
  );
}
