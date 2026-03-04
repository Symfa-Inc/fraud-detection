"use client";

import { useEffect, useRef, useState } from "react";

type NumericFeature = {
  id: string;
  label: string;
  type: "number";
  defaultValue: number;
  min?: number;
  max?: number;
  step?: number;
};

type SelectOption = string | { label: string; value: string };

type SelectFeature = {
  id: string;
  label: string;
  type: "select";
  options: SelectOption[];
  defaultValue: string;
};

export type Feature = NumericFeature | SelectFeature;

type FeaturePanelProps = {
  features: Feature[];
  featureValues: Record<string, string | number>;
  onFeatureChange: (id: string, value: string | number) => void;
  onEvaluate?: () => void;
  onReset?: () => void;
  canEvaluate?: boolean;
  hasPrediction?: boolean;
  isEvaluating?: boolean;
};

type Section = {
  id: string;
  title: string;
  featureIds: string[];
};

const SECTIONS: Section[] = [
  {
    id: "driver",
    title: "Driver Profile",
    featureIds: [
      "age_of_driver",
      "gender",
      "living_status",
      "high_education_ind",
    ],
  },
  {
    id: "claim",
    title: "Claim Context",
    featureIds: [
      "claim_day_of_week",
      "claim_est_payout",
      "annual_income",
      "witness_present_ind",
    ],
  },
  {
    id: "history",
    title: "Risk History",
    featureIds: ["past_num_of_claims", "safty_rating"],
  },
];

const SECTION_HINTS: Record<Section["id"], string> = {
  driver:
    "Driver Profile captures baseline claimant characteristics that influence fraud propensity.",
  claim:
    "Claim Context includes timing and payout-related factors tied to claim plausibility.",
  history:
    "Risk History summarizes prior behavior and historical signals used by the model.",
};

const FEATURE_HINTS: Record<string, string> = {
  age_of_driver: "Driver age in years. Typical range: 18 to 90.",
  gender: "Driver gender category used by the trained model.",
  high_education_ind:
    "Whether the driver has higher education background (Yes or No).",
  living_status: "Current housing status: owner or renter.",
  claim_day_of_week: "Day when the claim event was reported.",
  claim_est_payout:
    "Estimated payout amount for this claim in USD. Range: 0 to 20,000.",
  witness_present_ind:
    "Whether an independent witness was present at the incident.",
  annual_income: "Estimated annual income in USD. Range: 25,000 to 60,000.",
  past_num_of_claims:
    "Number of prior claims linked to the driver. Range: 0 to 20.",
  safty_rating: "Internal safety score used by the model. Range: 0 to 100.",
};

const BINARY_FEATURES = new Set(["high_education_ind", "witness_present_ind"]);

export default function FeaturePanel({
  features,
  featureValues,
  onFeatureChange,
  onEvaluate,
  onReset,
  canEvaluate = true,
  hasPrediction = false,
  isEvaluating = false,
}: FeaturePanelProps) {
  const featuresById = new Map(
    features.map((feature) => [feature.id, feature]),
  );
  const formRef = useRef<HTMLFormElement>(null);
  const [elapsed, setElapsed] = useState(0);

  /* Scroll wheel adjusts number inputs without scrolling the page */
  useEffect(() => {
    const el = formRef.current;
    if (!el) return;

    const handler = (e: WheelEvent) => {
      const input = (e.target as HTMLElement).closest(
        'input[type="number"]',
      ) as HTMLInputElement | null;
      if (!input) return;
      e.preventDefault();

      const field = input.dataset.field;
      if (!field) return;

      const step = parseFloat(input.step) || 1;
      const min = input.min !== "" ? parseFloat(input.min) : -Infinity;
      const max = input.max !== "" ? parseFloat(input.max) : Infinity;
      const current = parseFloat(input.value) || 0;
      const direction = e.deltaY < 0 ? 1 : -1;
      const decimals = Math.max((input.step.split(".")[1] || "").length, 0);
      const next = Math.min(
        max,
        Math.max(
          min,
          parseFloat((current + direction * step).toFixed(decimals)),
        ),
      );

      onFeatureChange(field, next);
    };

    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, [onFeatureChange]);

  /* Ctrl/Cmd + Enter to submit from any field */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        formRef.current?.requestSubmit();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  /* Elapsed timer while loading */
  useEffect(() => {
    if (!isEvaluating) return;
    const start = Date.now();
    const id = setInterval(() => {
      setElapsed((Date.now() - start) / 1000);
    }, 100);
    return () => clearInterval(id);
  }, [isEvaluating]);

  const handleSubmit = (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    onEvaluate?.();
  };

  return (
    <form ref={formRef} className="form-panel" onSubmit={handleSubmit}>
      {SECTIONS.map((section) => (
        <div key={section.id} className="form-section">
          <div className="section-label">
            <span className="section-label-main">
              {section.title}
              <InfoTooltip
                label={`About ${section.title}`}
                text={SECTION_HINTS[section.id]}
              />
            </span>
          </div>

          <div className="form-grid">
            {section.featureIds
              .map((id) => featuresById.get(id))
              .filter((feature): feature is Feature => Boolean(feature))
              .map((feature) =>
                BINARY_FEATURES.has(feature.id) ? (
                  <ToggleField
                    key={feature.id}
                    feature={feature}
                    value={featureValues[feature.id]}
                    onChange={(nextValue) =>
                      onFeatureChange(feature.id, nextValue)
                    }
                  />
                ) : (
                  <FeatureField
                    key={feature.id}
                    feature={feature}
                    value={featureValues[feature.id]}
                    onChange={(nextValue) =>
                      onFeatureChange(feature.id, nextValue)
                    }
                  />
                ),
              )}
          </div>
        </div>
      ))}

      <div className="form-actions">
        <button
          className={`run-btn${isEvaluating ? " is-loading" : ""}`}
          type="submit"
          disabled={isEvaluating || !canEvaluate}
        >
          {isEvaluating ? (
            <>
              <span className="spinner" />
              Evaluating
              <span className="elapsed-time">{elapsed.toFixed(1)}s</span>
            </>
          ) : hasPrediction ? (
            "Re-run Evaluation"
          ) : (
            "Run Evaluation"
          )}
        </button>
        <div className="form-footer">
          <button type="button" className="reset-link" onClick={onReset}>
            Reset to defaults
          </button>
          <span className="shortcut-hint">⌘/Ctrl + Enter</span>
        </div>
        <p className="form-status">
          {canEvaluate
            ? "Input changes are ready to score."
            : "Current values already match the latest result."}
        </p>
      </div>
    </form>
  );
}

function FeatureField({
  feature,
  value,
  onChange,
}: {
  feature: Feature;
  value: string | number;
  onChange: (value: string | number) => void;
}) {
  if (feature.type === "number") {
    const numericValue =
      typeof value === "number"
        ? value
        : value === ""
          ? (feature.min ?? 0)
          : Number(value);
    const safeValue = Number.isFinite(numericValue)
      ? numericValue
      : (feature.min ?? 0);

    return (
      <label className="field">
        <span
          className="field-label"
          data-hint={FEATURE_HINTS[feature.id] ?? "Feature used by the model."}
        >
          {feature.label}
        </span>
        <input
          type="number"
          data-field={feature.id}
          min={feature.min ?? 0}
          max={feature.max ?? 100}
          step={feature.step ?? 1}
          value={safeValue}
          onChange={(event) =>
            onChange(
              event.target.value === "" ? "" : Number(event.target.value),
            )
          }
        />
      </label>
    );
  }

  const options = feature.options.map((option) =>
    typeof option === "string" ? { label: option, value: option } : option,
  );

  return (
    <label className="field">
      <span
        className="field-label"
        data-hint={FEATURE_HINTS[feature.id] ?? "Feature used by the model."}
      >
        {feature.label}
      </span>
      <select
        value={String(value)}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={`${feature.id}-${option.value}`} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function ToggleField({
  feature,
  value,
  onChange,
}: {
  feature: Feature;
  value: string | number;
  onChange: (value: string | number) => void;
}) {
  const isChecked = String(value) === "1";

  return (
    <div className="field toggle-field">
      <span
        className="field-label"
        data-hint={FEATURE_HINTS[feature.id] ?? "Feature used by the model."}
      >
        {feature.label}
      </span>
      <label className="toggle-label toggle-label--grid">
        <input
          className="sr-only"
          type="checkbox"
          checked={isChecked}
          onChange={(e) => onChange(e.target.checked ? "1" : "0")}
        />
        <span className="toggle-dot" />
        {isChecked ? "Yes" : "No"}
      </label>
    </div>
  );
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
