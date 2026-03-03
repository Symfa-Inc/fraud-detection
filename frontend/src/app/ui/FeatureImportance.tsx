"use client";

import { formatExplainabilityValue } from "../utils/explainability";

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
  compact?: boolean;
  maxItems?: number;
};

export default function FeatureImportance({
  items,
  contributions,
  baseValue = 0,
  riskScore,
  isEvaluated = false,
  compact = false,
  maxItems = 10,
}: FeatureImportanceProps) {
  const contributionItems = [...(contributions ?? [])].sort(
    (a, b) => Math.abs(b.impact) - Math.abs(a.impact)
  );
  const visibleContributions = contributionItems.slice(0, maxItems);
  const hasContributions = visibleContributions.length > 0;

  return (
    <section className={`surface-card ${compact ? "p-4" : "p-5 md:p-6"}`}>
      <p className="kicker">Explainability</p>
      <h2
        className={`mt-2 font-semibold tracking-tight text-zinc-900 ${
          compact ? "text-xl" : "text-2xl md:text-[1.7rem]"
        }`}
      >
        {compact ? "SHAP-style Effects" : "Feature Effects"}
      </h2>
      <p className={`mt-2 ${compact ? "text-xs" : "text-sm"} text-zinc-500`}>
        {compact
          ? "Top local effects for this prediction, from baseline to current score."
          : "Review how each feature increases or decreases risk from the model baseline."}
      </p>

      {isEvaluated && hasContributions ? (
        <ContributionsView
          contributions={visibleContributions}
          baseValue={baseValue}
          riskScore={riskScore}
          compact={compact}
        />
      ) : isEvaluated ? (
        <GlobalImportanceView items={items.slice(0, maxItems)} compact={compact} />
      ) : (
        <EmptyStateView compact={compact} />
      )}
    </section>
  );
}

function EmptyStateView({ compact }: { compact: boolean }) {
  return (
    <div
      className={`mt-4 rounded-lg border border-dashed border-zinc-300 bg-zinc-50 text-center text-zinc-500 ${
        compact ? "px-3 py-4 text-xs" : "px-4 py-6 text-sm"
      }`}
    >
      Run evaluation to view feature impact details.
    </div>
  );
}

function ContributionsView({
  contributions,
  baseValue,
  riskScore,
  compact,
}: {
  contributions: FeatureContribution[];
  baseValue: number;
  riskScore?: number;
  compact: boolean;
}) {
  const sumImpacts = contributions.reduce((sum, item) => sum + item.impact, 0);
  const maxAbs = Math.max(
    Math.abs(baseValue),
    ...contributions.map((item) => Math.abs(item.impact)),
    0.01
  );
  const finalScore = riskScore ?? baseValue + sumImpacts;
  const baselinePercent = formatPercent(baseValue);
  const currentPercent = formatPercent(finalScore);

  return (
    <div className="mt-4 space-y-3">
      <div
        className={`rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-600 ${
          compact ? "px-2.5 py-2 text-[11px]" : "px-3 py-2 text-xs"
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <span>
            Baseline <strong className="font-semibold text-zinc-700">{baselinePercent}</strong>
          </span>
          <span>
            Current <strong className="font-semibold text-zinc-700">{currentPercent}</strong>
          </span>
        </div>
        <p className="mt-1">
          Feature effects total {formatPercent(sumImpacts)} from baseline to current.
        </p>
      </div>

      {contributions.map((item) => {
        const isPositive = item.impact >= 0;
        const widthPercent = (Math.abs(item.impact) / maxAbs) * 50;

        return (
          <article
            key={item.name}
            className={`rounded-lg border border-zinc-200 ${compact ? "p-2.5" : "p-3"}`}
          >
            <div className="flex items-start justify-between gap-2">
              <h3 className={`${compact ? "text-xs" : "text-sm"} font-medium text-zinc-900`}>
                {item.name}
              </h3>
              <span
                className={`rounded px-2 py-0.5 font-medium ${
                  compact ? "text-[10px]" : "text-[11px]"
                } ${isPositive ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}
              >
                {isPositive ? "Increases risk" : "Decreases risk"}
              </span>
            </div>

            <p className={`mt-1 ${compact ? "text-[11px]" : "text-xs"} text-zinc-500`}>
              Value:{" "}
              <span className="font-mono text-zinc-700">
                {formatExplainabilityValue(item.name, item.value)}
              </span>
            </p>

            <div
              className={`mt-2 flex items-center justify-between ${
                compact ? "text-[11px]" : "text-xs"
              } text-zinc-500`}
            >
              <span>Impact</span>
              <span className="font-mono text-zinc-800">
                {item.impact >= 0 ? "+" : ""}
                {formatPercent(item.impact)}
              </span>
            </div>

            <div
              className={`relative mt-1.5 rounded-full bg-zinc-100 ${
                compact ? "h-3.5" : "h-4"
              }`}
            >
              <div
                className="absolute left-1/2 top-0 h-full w-px -translate-x-px bg-zinc-400"
                aria-hidden="true"
              />
              <div
                className={`absolute top-[2px] h-[calc(100%-4px)] ${
                  isPositive ? "left-1/2 bg-red-500" : "right-1/2 bg-emerald-500"
                }`}
                style={{
                  width: `max(${widthPercent}%, 8px)`,
                  borderTopLeftRadius: isPositive ? 0 : 9999,
                  borderBottomLeftRadius: isPositive ? 0 : 9999,
                  borderTopRightRadius: isPositive ? 9999 : 0,
                  borderBottomRightRadius: isPositive ? 9999 : 0,
                }}
                aria-label={`${item.name} impact ${formatPercent(item.impact)}`}
              />
            </div>
          </article>
        );
      })}
    </div>
  );
}

function GlobalImportanceView({
  items,
  compact,
}: {
  items: FeatureImportanceItem[];
  compact: boolean;
}) {
  return (
    <div className="mt-4 space-y-2.5">
      <p className={`${compact ? "text-xs" : "text-sm"} text-zinc-500`}>
        Case-level effects are unavailable. Showing global feature importance.
      </p>

      {items.map((item) => (
        <article
          key={item.name}
          className={`rounded-lg border border-zinc-200 ${compact ? "p-2.5" : "p-3"}`}
        >
          <div className="flex items-center justify-between gap-2 text-sm">
            <h3 className={`${compact ? "text-xs" : "text-sm"} font-medium text-zinc-900`}>
              {item.name}
            </h3>
            <span className="font-mono text-xs text-zinc-500">
              {(item.value * 100).toFixed(0)}%
            </span>
          </div>

          <div className={`mt-2 rounded-full bg-zinc-100 ${compact ? "h-1.5" : "h-2"}`}>
            <div
              className={`rounded-full bg-zinc-900 ${compact ? "h-1.5" : "h-2"}`}
              style={{ width: `${item.value * 100}%` }}
              aria-label={`${item.name} importance ${Math.round(item.value * 100)} percent`}
            />
          </div>
        </article>
      ))}
    </div>
  );
}

function formatPercent(value: number) {
  return `${(value * 100).toFixed(2)}%`;
}
