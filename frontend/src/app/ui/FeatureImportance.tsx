"use client";

type FeatureImportanceItem = {
  name: string;
  value: number;
};

type FeatureContribution = {
  name: string;
  value: string;
  impact: number;
};

type FeatureImportanceProps = {
  items: FeatureImportanceItem[];
  contributions?: FeatureContribution[] | null;
  baseValue?: number;
  riskScore?: number;
  isEvaluated?: boolean;
};

export default function FeatureImportance({
  items,
  contributions,
  baseValue = 0,
  riskScore,
  isEvaluated = false,
}: FeatureImportanceProps) {
  const hasContributions = contributions && contributions.length > 0;

  return (
    <section
      className={`min-w-0 rounded-2xl border p-6 shadow-sm ${
        isEvaluated
          ? "border-slate-200 bg-white"
          : "border-slate-200 bg-slate-50/80"
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Explainability
          </p>
          <h3 className="mt-2 text-2xl font-semibold">
            {hasContributions
              ? "How each feature impacted the risk score"
              : "Why the model decided this"}
          </h3>
        </div>
      </div>

      {isEvaluated && hasContributions ? (
        <ContributionsView
          contributions={contributions}
          baseValue={baseValue}
          riskScore={riskScore}
        />
      ) : isEvaluated ? (
        <GlobalImportanceView items={items} />
      ) : (
        <EmptyStateView />
      )}
    </section>
  );
}

function EmptyStateView() {
  return (
    <div className="mt-6 flex min-h-[12rem] flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-100/50 px-6 py-8 text-center">
      <p className="text-sm text-slate-500">
        Run Evaluate to see how each feature impacted the risk score.
      </p>
      <p className="mt-1 text-xs text-slate-400">
        Feature contributions will appear here after evaluation.
      </p>
    </div>
  );
}

function ContributionsView({
  contributions,
  baseValue,
  riskScore,
}: {
  contributions: FeatureContribution[];
  baseValue: number;
  riskScore?: number;
}) {
  const sumImpacts = contributions.reduce((s, c) => s + c.impact, 0);
  const maxAbs = Math.max(
    Math.abs(baseValue),
    ...contributions.map((c) => Math.abs(c.impact)),
    0.01
  );

  return (
    <div className="mt-6 space-y-4">
      <p className="text-sm text-slate-600">
        Each feature adds or subtracts from the baseline.{" "}
        <strong>Baseline ({((baseValue ?? 0) * 100).toFixed(1)}%)</strong> +
        feature impacts = <strong>risk score</strong>.
      </p>
      {contributions.map((c) => {
        const isPositive = c.impact >= 0;
        const pct = (Math.abs(c.impact) / maxAbs) * 50;
        return (
          <div key={c.name} className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-slate-700">
                {c.name} = {c.value}
              </span>
              <span
                className={
                  isPositive
                    ? "font-semibold tabular-nums text-rose-600"
                    : "font-semibold tabular-nums text-sky-600"
                }
              >
                {c.impact >= 0 ? "+" : ""}
                {(c.impact * 100).toFixed(2)}% {isPositive ? "↑" : "↓"}
              </span>
            </div>
            <div className="relative flex h-6 items-center">
              <div className="absolute left-1/2 h-0.5 w-px -translate-x-px bg-slate-300" />
              <div
                className={`absolute top-1/2 h-4 -translate-y-1/2 rounded ${
                  isPositive ? "left-1/2 bg-rose-500" : "right-1/2 bg-sky-500"
                }`}
                style={{
                  width: `${pct}%`,
                  ...(isPositive ? { left: "50%" } : { right: "50%" }),
                }}
              />
            </div>
          </div>
        );
      })}
      {riskScore !== undefined && (
        <div className="rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-3">
          <p className="text-sm font-medium text-slate-700">
            {(baseValue * 100).toFixed(2)}% baseline + {(sumImpacts * 100).toFixed(2)}%
            (from features) ={" "}
            <strong className="text-indigo-700">
              {(riskScore * 100).toFixed(2)}% risk score
            </strong>
          </p>
        </div>
      )}
      <p className="mt-2 text-xs text-slate-500">
        Positive (red) adds to the risk score; negative (blue) subtracts from it.
      </p>
    </div>
  );
}

function GlobalImportanceView({
  items,
}: {
  items: FeatureImportanceItem[];
}) {
  return (
    <div className="mt-6 space-y-4">
      {items.map((item) => (
        <div key={item.name} className="space-y-2">
          <div className="flex items-center justify-between text-sm font-medium">
            <span>{item.name}</span>
            <span className="text-slate-400">
              {(item.value * 100).toFixed(0)}%
            </span>
          </div>
          <div className="h-3 rounded-full bg-slate-100">
            <div
              className="h-3 rounded-full bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-400"
              style={{ width: `${item.value * 100}%` }}
              aria-label={`${item.name} importance`}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
