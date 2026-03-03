"use client";

import { formatExplainabilityValue } from "../utils/explainability";

type FeatureContribution = {
  name: string;
  value: string;
  impact: number;
};

type GlobalImportanceItem = {
  name: string;
  value: number;
};

type SummaryPanelProps = {
  summary: string;
  isEvaluated: boolean;
  riskScore?: number;
  contributions?: FeatureContribution[] | null;
  globalItems?: GlobalImportanceItem[];
};

export default function SummaryPanel({
  summary,
  isEvaluated,
  riskScore,
  contributions,
  globalItems = [],
}: SummaryPanelProps) {
  const local = [...(contributions ?? [])];
  const hasLocal = local.length > 0;

  const topOverallLocal = [...local]
    .sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact))
    .slice(0, 3);
  const topGlobal = [...globalItems]
    .sort((a, b) => b.value - a.value)
    .slice(0, 3);

  const riskDrivers = [...local]
    .filter((item) => item.impact > 0)
    .sort((a, b) => b.impact - a.impact)
    .slice(0, 3);
  const protectiveSignals = [...local]
    .filter((item) => item.impact < 0)
    .sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact))
    .slice(0, 3);

  const topOverallLines = hasLocal
    ? topOverallLocal.map(
        (item) =>
          `${item.name} (${formatExplainabilityValue(item.name, item.value)}): ${formatImpact(item.impact)} impact`
      )
    : topGlobal.map(
        (item) => `${item.name}: ${(item.value * 100).toFixed(1)}% importance`
      );

  const riskDriverLines = hasLocal
    ? riskDrivers.length > 0
      ? riskDrivers.map(
          (item) =>
            `${item.name} (${formatExplainabilityValue(item.name, item.value)}): ${formatImpact(item.impact)} impact`
        )
      : ["No strong upward pressure on risk in this profile."]
    : topGlobal.map(
        (item) =>
          `${item.name} · ${(item.value * 100).toFixed(1)}% global importance`
      );

  const protectiveLines = hasLocal
    ? protectiveSignals.length > 0
      ? protectiveSignals.map(
          (item) =>
            `${item.name} (${formatExplainabilityValue(item.name, item.value)}): ${formatImpact(item.impact)} impact`
        )
      : ["No strong protective signals in this profile."]
    : ["Protective signals require local contribution output."];

  const leadName =
    hasLocal && topOverallLocal.length > 0
      ? topOverallLocal[0].name
      : topGlobal[0]?.name ?? "model factors";

  const headline = hasLocal
    ? `Top local driver: ${leadName}`
    : `Top global factor: ${leadName}`;
  const sourceLabel = hasLocal ? "OPENAI" : "FALLBACK";
  const renderedSummary = formatSummaryProbabilities(summary, riskScore);

  return (
    <section className="summary-panel">
      <div className="summary-card-head">
        <span className="summary-card-title">
          Executive Summary
          <InfoTooltip
            label="About Executive Summary"
            text="A structured summary of the claim's risk profile, key risk drivers, protective factors, and top overall contributors."
          />
        </span>
        <span
          className={`summary-source summary-source-${hasLocal ? "openai" : "fallback"}`}
        >
          {sourceLabel}
        </span>
      </div>

      {!isEvaluated ? (
        <div className="summary-empty">
          Run evaluation to populate explainability groups.
        </div>
      ) : (
        <>
          <p className="summary-headline">{headline}</p>
          <p className="summary-text">{renderedSummary}</p>

          <div className="summary-columns">
            <div className="summary-group">
              <h3>Risk Drivers</h3>
              <ul>
                {riskDriverLines.map((line, index) => (
                  <li key={`risk-${index}`}>{line}</li>
                ))}
              </ul>
            </div>

            <div className="summary-group">
              <h3>Protective Signals</h3>
              <ul>
                {protectiveLines.map((line, index) => (
                  <li key={`protect-${index}`}>{line}</li>
                ))}
              </ul>
            </div>

            <div className="summary-group">
              <h3>Top 3 Overall</h3>
              <ul>
                {topOverallLines.map((line, index) => (
                  <li key={`top-${index}`}>{line}</li>
                ))}
              </ul>
            </div>
          </div>
        </>
      )}
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

function formatImpact(value: number) {
  const sign = value >= 0 ? "+" : "-";
  return `${sign}${Math.abs(value * 100).toFixed(2)}%`;
}

function formatScorePercent(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

function formatSummaryProbabilities(
  text: string,
  riskScore?: number
): string {
  return text.replace(/\b0?\.\d+\b/g, (match, offset, fullText) => {
    const numeric = Number(match);
    if (!Number.isFinite(numeric) || numeric < 0 || numeric > 1) {
      return match;
    }

    const start = Math.max(0, offset - 24);
    const end = Math.min(fullText.length, offset + match.length + 24);
    const context = fullText.slice(start, end).toLowerCase();
    const looksLikeScore = /(risk|score|probab|fraud)/.test(context);
    if (!looksLikeScore) {
      return match;
    }

    if (riskScore !== undefined) {
      return formatScorePercent(riskScore);
    }

    return `${(numeric * 100).toFixed(1)}%`;
  });
}
