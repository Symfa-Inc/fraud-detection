"use client";

import { useEffect, useState } from "react";
import { logBackendRoot } from "./utils/api";

import FeatureImportance from "./ui/FeatureImportance";
import FeaturePanel, { Feature } from "./ui/FeaturePanel";
import StatusSummary from "./ui/StatusSummary";

const features: Feature[] = [
  {
    id: "claim_amount",
    label: "Claim amount",
    type: "number",
    defaultValue: 12500,
    min: 0,
    max: 50000,
    step: 100,
  },
  {
    id: "policy_age",
    label: "Policy age (months)",
    type: "number",
    defaultValue: 28,
    min: 0,
    max: 120,
    step: 1,
  },
  {
    id: "accident_location",
    label: "Accident location",
    type: "select",
    options: ["Urban", "Suburban", "Rural"],
    defaultValue: "Urban",
  },
  {
    id: "claim_type",
    label: "Claim type",
    type: "select",
    options: ["Collision", "Theft", "Glass", "Weather"],
    defaultValue: "Collision",
  },
  {
    id: "prior_claims",
    label: "Prior claims",
    type: "number",
    defaultValue: 2,
    min: 0,
    max: 20,
    step: 1,
  },
  {
    id: "vehicle_age",
    label: "Vehicle age (years)",
    type: "number",
    defaultValue: 7,
    min: 0,
    max: 30,
    step: 1,
  },
  {
    id: "repair_estimate",
    label: "Repair estimate",
    type: "number",
    defaultValue: 8600,
    min: 0,
    max: 30000,
    step: 100,
  },
  {
    id: "injury_reported",
    label: "Injury reported",
    type: "select",
    options: ["No", "Yes"],
    defaultValue: "No",
  },
  {
    id: "police_report",
    label: "Police report",
    type: "select",
    options: ["Filed", "Not filed"],
    defaultValue: "Filed",
  },
  {
    id: "time_since_policy_start",
    label: "Time since policy start (days)",
    type: "number",
    defaultValue: 410,
    min: 0,
    max: 2000,
    step: 5,
  },
];

const featureImportance = [
  { name: "Claim amount", value: 0.92 },
  { name: "Prior claims", value: 0.81 },
  { name: "Accident location", value: 0.74 },
  { name: "Repair estimate", value: 0.63 },
  { name: "Policy age", value: 0.58 },
  { name: "Vehicle age", value: 0.41 },
];

const clamp = (value: number, min = 0, max = 1) =>
  Math.min(Math.max(value, min), max);

const getNumberValue = (value: string | number) => {
  if (value === "") {
    return 0;
  }
  return Number(value);
};

export default function Home() {
  useEffect(() => {
    logBackendRoot();
  }, []);

  const [featureValues, setFeatureValues] = useState(() => {
    const initialValues: Record<string, string | number> = {};
    features.forEach((feature) => {
      initialValues[feature.id] = feature.defaultValue;
    });
    return initialValues;
  });

  const updateFeatureValue = (id: string, value: string | number) => {
    setFeatureValues((prev) => ({ ...prev, [id]: value }));
  };

  const claimAmount = getNumberValue(featureValues.claim_amount);
  const policyAge = getNumberValue(featureValues.policy_age);
  const priorClaims = getNumberValue(featureValues.prior_claims);
  const vehicleAge = getNumberValue(featureValues.vehicle_age);
  const repairEstimate = getNumberValue(featureValues.repair_estimate);
  const timeSincePolicyStart = getNumberValue(
    featureValues.time_since_policy_start,
  );
  const accidentLocation = String(featureValues.accident_location);
  const claimType = String(featureValues.claim_type);
  const injuryReported = String(featureValues.injury_reported);
  const policeReport = String(featureValues.police_report);

  const baseScore =
    0.22 +
    0.18 * clamp(claimAmount / 50000) +
    0.12 * clamp(repairEstimate / 30000) +
    0.1 * clamp(priorClaims / 10) +
    0.08 * clamp(vehicleAge / 20) +
    0.08 * clamp(policyAge / 60) +
    0.06 * clamp(timeSincePolicyStart / 1000);

  const categoricalScore =
    (accidentLocation === "Urban" ? 0.05 : 0) +
    (claimType === "Theft" ? 0.08 : 0) +
    (injuryReported === "Yes" ? 0.06 : 0) +
    (policeReport === "Not filed" ? 0.07 : 0);

  const riskScore = clamp(baseScore + categoricalScore, 0, 1);
  const threshold = 0.65;
  const status =
    riskScore >= threshold ? "Status: Fraud Likely" : "Status: Low Risk";
  const summary =
    riskScore >= threshold
      ? "The model predicts a high probability of fraud for this claim. This assessment is driven by elevated risk indicators in the selected features."
      : "The model predicts a low probability of fraud for this claim. Most signals fall within expected ranges, lowering the overall risk.";


  return (
    <div
      className="min-h-screen bg-slate-50 text-slate-900"
      style={{
        backgroundImage:
          "radial-gradient(circle at top left, rgba(148, 163, 184, 0.25), transparent 45%), radial-gradient(circle at 30% 20%, rgba(226, 232, 240, 0.8), transparent 55%), radial-gradient(circle at 90% 10%, rgba(199, 210, 254, 0.35), transparent 45%)",
      }}
    >
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-6 py-10 md:flex-row">
        <FeaturePanel
          features={features}
          featureValues={featureValues}
          onFeatureChange={updateFeatureValue}
        />

        <main className="flex-1">
          <div className="space-y-8 md:sticky md:top-8 md:self-start">
            <StatusSummary
              status={status}
              summary={summary}
              score={riskScore}
              threshold={threshold}
            />

            <FeatureImportance items={featureImportance} />
          </div>
        </main>
      </div>
    </div>
  );
}
