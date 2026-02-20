"use client";

type FeatureImportanceItem = {
  name: string;
  value: number;
};

type FeatureImportanceProps = {
  items: FeatureImportanceItem[];
};

export default function FeatureImportance({ items }: FeatureImportanceProps) {
  return (
    <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Feature Importance
          </p>
          <h3 className="mt-2 text-2xl font-semibold">
            Why the model decided this
          </h3>
        </div>
      </div>
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
    </section>
  );
}
