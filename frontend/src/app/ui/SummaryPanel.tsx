"use client";

type SummaryPanelProps = {
  summary: string;
};

export default function SummaryPanel({ summary }: SummaryPanelProps) {
  return (
    <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
        Summary
      </p>
      <p className="mt-3 text-sm leading-relaxed text-slate-600">{summary}</p>
    </section>
  );
}
