"use client";

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
      "high_education_ind",
      "living_status",
    ],
  },
  {
    id: "claim",
    title: "Claim Context",
    featureIds: [
      "claim_day_of_week",
      "claim_est_payout",
      "witness_present_ind",
      "annual_income",
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
  past_num_of_claims: "Number of prior claims linked to the driver. Range: 0 to 20.",
  safty_rating: "Internal safety score used by the model. Range: 0 to 100.",
};

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
  const featuresById = new Map(features.map((feature) => [feature.id, feature]));

  return (
    <section className="surface-card p-5 md:p-6">
      <p className="kicker">Inputs</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900">
        Claim Parameters
      </h2>
      <p className="mt-2 text-sm text-zinc-500">
        Enter claim details, then run one model pass.
      </p>

      <div className="mt-6 space-y-6">
        {SECTIONS.map((section) => (
          <fieldset key={section.id} className="border-0 p-0">
            <div className="flex items-center gap-3">
              <legend className="flex items-center gap-1.5 text-xs font-medium tracking-wide text-zinc-500 uppercase">
                <span>{section.title}</span>
                <InfoTooltip
                  label={`About ${section.title}`}
                  text={SECTION_HINTS[section.id]}
                />
              </legend>
              <span className="h-px flex-1 bg-zinc-200" />
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {section.featureIds
                .map((id) => featuresById.get(id))
                .filter((feature): feature is Feature => Boolean(feature))
                .map((feature) => (
                  <FeatureField
                    key={feature.id}
                    feature={feature}
                    value={featureValues[feature.id]}
                    onChange={(nextValue) => onFeatureChange(feature.id, nextValue)}
                  />
                ))}
            </div>
          </fieldset>
        ))}
      </div>

      <div className="mt-6 space-y-2.5 border-t border-zinc-200 pt-5">
        <button
          type="button"
          onClick={onEvaluate}
          disabled={isEvaluating || !canEvaluate}
          className="h-11 w-full rounded-md bg-zinc-900 px-4 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-45"
        >
          {isEvaluating
            ? "Running evaluation..."
            : hasPrediction
              ? "Re-run evaluation"
              : "Run evaluation"}
        </button>

        <button
          type="button"
          onClick={onReset}
          className="h-11 w-full rounded-md border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
        >
          Reset to defaults
        </button>

        <p className="pt-1 text-xs text-zinc-400">
          {canEvaluate
            ? "Input changes are ready to score."
            : "Current values already match the latest result."}
        </p>
      </div>
    </section>
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
          ? feature.min ?? 0
          : Number(value);
    const safeValue = Number.isFinite(numericValue)
      ? numericValue
      : feature.min ?? 0;

    return (
      <label className="block rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5">
        <FieldLabel
          label={feature.label}
          hint={FEATURE_HINTS[feature.id] ?? "Feature used by the fraud model."}
        />
        <input
          type="number"
          min={feature.min ?? 0}
          max={feature.max ?? 100}
          step={feature.step ?? 1}
          value={safeValue}
          onChange={(event) =>
            onChange(event.target.value === "" ? "" : Number(event.target.value))
          }
          className="mt-1.5 h-9 w-full rounded-md border border-zinc-200 bg-white px-2.5 text-sm text-zinc-900"
        />
        <span className="mt-1 block font-mono text-[10px] text-zinc-400">
          {feature.min ?? 0} - {feature.max ?? 100}
        </span>
      </label>
    );
  }

  const options = feature.options.map((option) =>
    typeof option === "string" ? { label: option, value: option } : option
  );

  return (
    <label className="block rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5">
      <FieldLabel
        label={feature.label}
        hint={FEATURE_HINTS[feature.id] ?? "Feature used by the fraud model."}
      />
      <select
        value={String(value)}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1.5 h-9 w-full rounded-md border border-zinc-200 bg-white px-2.5 text-sm text-zinc-900"
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

function FieldLabel({ label, hint }: { label: string; hint: string }) {
  return (
    <span className="flex items-center gap-1.5 text-xs text-zinc-500">
      <span>{label}</span>
      <InfoTooltip label={`About ${label}`} text={hint} />
    </span>
  );
}

function InfoTooltip({ label, text }: { label: string; text: string }) {
  return (
    <button type="button" className="group relative inline-flex" aria-label={label}>
      <svg
        viewBox="0 0 20 20"
        fill="currentColor"
        className="h-3.5 w-3.5 text-zinc-400 transition-colors group-hover:text-zinc-600 group-focus-visible:text-zinc-600"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M10 2a8 8 0 100 16 8 8 0 000-16zm.75 4.75a.75.75 0 10-1.5 0v.5a.75.75 0 001.5 0v-.5zm0 3.5a.75.75 0 00-1.5 0v3a.75.75 0 001.5 0v-3z"
          clipRule="evenodd"
        />
      </svg>
      <span className="pointer-events-none absolute bottom-[calc(100%+8px)] left-1/2 z-20 w-56 -translate-x-1/2 rounded-md border border-zinc-200 bg-white px-2.5 py-2 text-[11px] font-normal leading-relaxed text-zinc-600 opacity-0 shadow-sm transition-all group-hover:translate-y-[-2px] group-hover:opacity-100 group-focus-visible:translate-y-[-2px] group-focus-visible:opacity-100">
        {text}
      </span>
    </button>
  );
}
