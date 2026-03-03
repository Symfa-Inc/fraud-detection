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
  maxItems = 10,
}: FeatureImportanceProps) {
  const contributionItems = [...(contributions ?? [])].sort(
    (a, b) => Math.abs(b.impact) - Math.abs(a.impact)
  );
  const visibleContributions = contributionItems.slice(0, maxItems);
  const hasContributions = visibleContributions.length > 0;

  if (!isEvaluated) return null;

  if (hasContributions) {
    return (
      <WaterfallView
        contributions={visibleContributions}
        baseValue={baseValue}
        riskScore={riskScore}
      />
    );
  }

  return <GlobalImportanceView items={items.slice(0, maxItems)} />;
}

function WaterfallView({
  contributions,
  baseValue,
  riskScore,
}: {
  contributions: FeatureContribution[];
  baseValue: number;
  riskScore?: number;
}) {
  const sumImpacts = contributions.reduce((sum, item) => sum + item.impact, 0);
  const finalScore = riskScore ?? baseValue + sumImpacts;

  const deltaToFinal = finalScore - baseValue;
  const maxAbs = Math.max(
    Math.abs(deltaToFinal),
    ...contributions.map((item) => Math.abs(item.impact)),
    0.001
  );
  const axisHalfWidth = 40;
  const baselinePos = 50;

  const segments = contributions.map((item, index) => {
    const width = Math.max(
      (Math.abs(item.impact) / maxAbs) * axisHalfWidth,
      1.2
    );
    const left = item.impact >= 0 ? baselinePos : baselinePos - width;
    const direction =
      item.impact > 0
        ? "increase"
        : item.impact < 0
          ? "decrease"
          : "neutral";

    return { ...item, key: `${item.name}-${index}`, left, width, direction };
  });

  return (
    <section className="explanation-block">
      <div className="explanation-head">
        <span className="explanation-head-main">
          Feature Effects
          <InfoTooltip
            label="How to read Feature Effects"
            text="Baseline is the model's starting risk for a typical profile. Each bar shows how one feature moves risk up (red) or down (green) from that baseline."
          />
        </span>
      </div>

      <div className="waterfall-summary">
        <span>Baseline {formatPercent(baseValue)}</span>
        <span>Current {formatPercent(finalScore)}</span>
      </div>

      <ul className="waterfall-list">
        {segments.map((segment, i) => (
          <li
            key={segment.key}
            className="waterfall-row"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="waterfall-meta">
              <span className="waterfall-name">{segment.name}</span>
              <span
                className={`waterfall-delta waterfall-delta-${segment.direction}`}
              >
                {formatEffect(segment.impact)}
              </span>
            </div>

            <div className="waterfall-track">
              <span
                className="waterfall-marker waterfall-marker-base"
                style={{ left: `${baselinePos}%` }}
              />
              <span
                className={`waterfall-bar waterfall-${segment.direction}`}
                style={{
                  left: `${segment.left}%`,
                  width: `${segment.width}%`,
                }}
              />
            </div>

            <div className="waterfall-values">
              value{" "}
              {formatExplainabilityValue(segment.name, segment.value)}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function GlobalImportanceView({
  items,
}: {
  items: FeatureImportanceItem[];
}) {
  return (
    <section className="explanation-block">
      <div className="explanation-head">
        <span className="explanation-head-main">
          Global Importance
          <InfoTooltip
            label="About Global Importance"
            text="Case-level SHAP effects are unavailable. Showing global feature importance from the trained model."
          />
        </span>
      </div>

      <ul className="importance-list">
        {items.map((item) => (
          <li key={item.name} className="importance-row">
            <div className="importance-meta">
              <span className="importance-name">{item.name}</span>
              <span className="importance-value">
                {(item.value * 100).toFixed(0)}%
              </span>
            </div>

            <div className="importance-track">
              <div
                className="importance-bar"
                style={{ width: `${item.value * 100}%` }}
                aria-label={`${item.name} importance ${Math.round(item.value * 100)} percent`}
              />
            </div>
          </li>
        ))}
      </ul>
    </section>
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

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

function formatEffect(effect: number): string {
  return `${effect >= 0 ? "+" : "-"}${Math.abs(effect * 100).toFixed(1)}%`;
}
