"use client";

type StatusSummaryProps = {
  status: string;
  score: number;
  threshold: number;
  isEvaluated: boolean;
  isEvaluating: boolean;
};

export default function StatusSummary({
  status,
  score,
  threshold,
  isEvaluated,
  isEvaluating,
}: StatusSummaryProps) {
  const scorePercent = Math.max(0, Math.min(100, score * 100));
  const thresholdPercent = Math.max(0, Math.min(100, threshold * 100));
  const isLowRisk = score < threshold;

  const tone = isEvaluated
    ? isLowRisk
      ? {
          badge: "bg-emerald-100 text-emerald-700",
          bar: "bg-emerald-600",
          delta: `${(thresholdPercent - scorePercent).toFixed(1)}% below threshold`,
        }
      : {
          badge: "bg-red-100 text-red-700",
          bar: "bg-red-600",
          delta: `${(scorePercent - thresholdPercent).toFixed(1)}% above threshold`,
        }
    : {
        badge: "bg-zinc-100 text-zinc-600",
        bar: "bg-zinc-400",
        delta: "No score yet",
      };

  return (
    <section className="surface-card p-5 md:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="kicker">Model Output</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900">
            Decision Status
          </h2>
          <p className="mt-2 text-sm text-zinc-500">
            {isEvaluating
              ? "Scoring current inputs."
              : isEvaluated
                ? "Risk output for the current claim profile."
                : "Run evaluation to see model decision and score."}
          </p>
        </div>

        <span className={`rounded-md px-2.5 py-1 text-xs font-medium ${tone.badge}`}>
          {isEvaluated ? status : "Awaiting run"}
        </span>
      </div>

      <div className="mt-4 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-zinc-500">Risk score</p>
            <p className="mt-1 font-mono text-3xl font-semibold tracking-tight text-zinc-900">
              {scorePercent.toFixed(1)}%
            </p>
          </div>
          <p className="text-xs text-zinc-500">
            Threshold {thresholdPercent.toFixed(1)}%
          </p>
        </div>

        <div className="relative mt-3 h-2.5 rounded-full bg-zinc-100">
          <div
            className={`h-2.5 rounded-full transition-all duration-300 ${tone.bar}`}
            style={{ width: `${isEvaluated ? scorePercent : 0}%` }}
          />
          <div
            className="absolute top-[-4px] h-4 w-[2px] bg-zinc-500"
            style={{ left: `${thresholdPercent}%` }}
            aria-hidden="true"
          />
        </div>

        <p className="mt-2 text-xs text-zinc-500">{tone.delta}</p>
      </div>
    </section>
  );
}
