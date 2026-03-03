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
  const topGlobal = [...globalItems].sort((a, b) => b.value - a.value).slice(0, 3);

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
          `${item.name} (${formatExplainabilityValue(item.name, item.value)}) · ${formatImpact(item.impact)} impact`
      )
    : topGlobal.map(
        (item) => `${item.name} · ${(item.value * 100).toFixed(1)}% importance`
      );

  const riskDriverLines = hasLocal
    ? riskDrivers.length > 0
      ? riskDrivers.map(
          (item) =>
            `${item.name} (${formatExplainabilityValue(item.name, item.value)}) · ${formatImpact(item.impact)} impact`
        )
      : ["No strong upward pressure on risk in this profile."]
    : topGlobal.map(
        (item) => `${item.name} · ${(item.value * 100).toFixed(1)}% global importance`
      );

  const protectiveLines = hasLocal
    ? protectiveSignals.length > 0
      ? protectiveSignals.map(
          (item) =>
            `${item.name} (${formatExplainabilityValue(item.name, item.value)}) · ${formatImpact(item.impact)} impact`
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
    <section className="surface-card p-5 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="kicker">Explainability</p>
        <span
          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] ${
            hasLocal
              ? "border-blue-200 bg-blue-50 text-blue-700"
              : "border-zinc-200 bg-zinc-100 text-zinc-600"
          }`}
        >
          {sourceLabel}
        </span>
      </div>

      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900 md:text-[1.7rem]">
        Explainability Summary
      </h2>

      {!isEvaluated ? (
        <div className="mt-4 rounded-lg border border-dashed border-zinc-300 bg-zinc-50 px-4 py-6 text-center text-sm text-zinc-500">
          Run evaluation to populate explainability groups.
        </div>
      ) : (
        <>
          <p className="mt-3 text-sm font-medium text-zinc-800">{headline}</p>
          <p className="mt-1.5 text-sm leading-relaxed text-zinc-600">
            {renderedSummary}
          </p>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <ExplainabilityGroup
              title="Risk Drivers"
              tone="risk"
              lines={riskDriverLines}
            />
            <ExplainabilityGroup
              title="Protective Signals"
              tone="protective"
              lines={protectiveLines}
            />
            <ExplainabilityGroup
              title="Top 3 Overall"
              tone="neutral"
              lines={topOverallLines}
            />
          </div>
        </>
      )}
    </section>
  );
}

function ExplainabilityGroup({
  title,
  lines,
  tone,
}: {
  title: string;
  lines: string[];
  tone: "risk" | "protective" | "neutral";
}) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3.5">
      <h3 className="text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-500">
        {title}
      </h3>
      <ul className="mt-2 space-y-2">
        {lines.map((line, index) => (
          <li
            key={`${title}-${index}`}
            className={`rounded-md border px-2.5 py-2 text-xs leading-relaxed ${
              tone === "risk"
                ? "border-red-200 bg-red-50/70 text-red-800"
                : tone === "protective"
                  ? "border-blue-200 bg-blue-50/70 text-blue-800"
                  : "border-zinc-200 bg-white text-zinc-700"
            }`}
          >
            {line}
          </li>
        ))}
      </ul>
    </div>
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
