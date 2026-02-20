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

type SelectFeature = {
  id: string;
  label: string;
  type: "select";
  options: string[];
  defaultValue: string;
};

export type Feature = NumericFeature | SelectFeature;

type FeaturePanelProps = {
  features: Feature[];
  featureValues: Record<string, string | number>;
  onFeatureChange: (id: string, value: string | number) => void;
  onEvaluate?: () => void;
  isEvaluating?: boolean;
};

export default function FeaturePanel({
  features,
  featureValues,
  onFeatureChange,
  onEvaluate,
  isEvaluating = false,
}: FeaturePanelProps) {
  return (
    <aside className="w-full shrink-0 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:w-[20rem] lg:w-[22rem]">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
          Claim Features
        </p>
        <h1 className="mt-2 text-2xl font-semibold">Fraud Signals</h1>
      </div>
      <p className="mt-3 text-sm text-slate-500">
        Inputs used by the model to evaluate this claim.
      </p>
      <div className="mt-6 grid grid-cols-1 gap-4 text-sm">
        {features.map((feature) => {
          const rawValue = featureValues[feature.id];
          const numericValue =
            typeof rawValue === "number"
              ? rawValue
              : rawValue === ""
                ? (feature as NumericFeature).min ?? 0
                : Number(rawValue);
          const clampedValue = Number.isFinite(numericValue)
            ? Math.min(
              Math.max(numericValue, (feature as NumericFeature).min ?? 0),
              (feature as NumericFeature).max ?? numericValue,
            )
            : (feature as NumericFeature).min ?? 0;

          return (
            <label
              key={feature.id}
              className="flex min-h-[6.5rem] min-w-0 flex-col justify-between gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-3"
            >
              <span className="block font-medium">{feature.label}</span>
              {feature.type === "number" ? (
                <div className="space-y-2">
                  <input
                    type="range"
                    min={feature.min ?? 0}
                    max={feature.max ?? 100}
                    step={feature.step ?? 1}
                    value={clampedValue}
                    onInput={(event) =>
                      onFeatureChange(
                        feature.id,
                        Number((event.target as HTMLInputElement).value),
                      )
                    }
                    className="w-full accent-indigo-500"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={feature.min ?? 0}
                      max={feature.max ?? 100}
                      step={feature.step ?? 1}
                      value={clampedValue}
                      onChange={(event) =>
                        onFeatureChange(
                          feature.id,
                          event.target.value === ""
                            ? ""
                            : Number(event.target.value),
                        )
                      }
                      className="flex-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-700 tabular-nums focus:border-slate-400 focus:outline-none"
                    />
                    <span className="w-12 text-right text-xs font-semibold text-slate-400 tabular-nums">
                      {clampedValue}
                    </span>
                  </div>
                </div>
              ) : (
                <select
                  value={String(featureValues[feature.id])}
                  onChange={(event) =>
                    onFeatureChange(feature.id, event.target.value)
                  }
                  className="w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-700 focus:border-slate-400 focus:outline-none"
                >
                  {feature.options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              )}
            </label>
          );
        })}
      </div>
      <button
        type="button"
        onClick={onEvaluate}
        disabled={isEvaluating}
        className="mt-6 w-full rounded-xl bg-indigo-500 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isEvaluating ? "Evaluating…" : "Evaluate"}
      </button>
    </aside>
  );
}
