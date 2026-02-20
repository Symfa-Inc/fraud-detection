"use client";

type StatusSummaryProps = {
  status: string;
  score: number;
  threshold: number;
};

export default function StatusSummary({
  status,
  score,
  threshold,
}: StatusSummaryProps) {
  const isLowRisk = score < threshold;
  return (
    <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="flex min-h-[7.5rem] flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Current Decision
          </p>
          <h2 className="mt-2 min-h-[2.5rem] text-3xl font-semibold">{status}</h2>
        </div>
        <div
          className={`min-w-[10rem] shrink-0 rounded-2xl border px-6 py-4 text-center ${isLowRisk
            ? "border-emerald-100 bg-emerald-50"
            : "border-rose-100 bg-rose-50"
            }`}
        >
          <p
            className={`text-xs font-semibold uppercase tracking-[0.18em] ${isLowRisk ? "text-emerald-600" : "text-rose-500"
              }`}
          >
            Risk Score
          </p>
          <p
            className={`mt-2 text-3xl font-semibold tabular-nums ${isLowRisk ? "text-emerald-600" : "text-rose-600"
              }`}
          >
            {score.toFixed(2)}
          </p>
          <p className={`text-xs tabular-nums ${isLowRisk ? "text-emerald-500" : "text-rose-500"}`}>
            Threshold {threshold.toFixed(2)}
          </p>
        </div>
      </div>
    </section>
  );
}
