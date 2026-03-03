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
}: StatusSummaryProps) {
  const scorePercent = Math.max(0, Math.min(100, Math.round(score * 100)));
  const thresholdPercent = Math.max(
    0,
    Math.min(100, Math.round(threshold * 100)),
  );
  const isLowRisk = score < threshold;
  const tier = isLowRisk ? "low" : "high";
  const tierLabel = isLowRisk ? "Low Risk" : "Fraud Likely";

  const gaugeStyle = isEvaluated
    ? ({
        "--gauge-deg": `${Math.round(score * 360)}deg`,
        "--gauge-color": isLowRisk ? "var(--low)" : "var(--high)",
      } as React.CSSProperties)
    : undefined;

  const delta = isLowRisk
    ? `${(thresholdPercent - scorePercent).toFixed(1)}% below threshold`
    : `${(scorePercent - thresholdPercent).toFixed(1)}% above threshold`;

  return (
    <>
      <div className="gauge-wrap">
        <div className="gauge-ring" style={gaugeStyle}>
          <div className="gauge-inner">
            <div className="gauge-percent">{scorePercent}%</div>
            <div className={`gauge-tier tier-${tier}`}>{tierLabel}</div>
          </div>
        </div>
      </div>

      <div className="gauge-meta">
        <span>Threshold {thresholdPercent}%</span>
        <span>{delta}</span>
      </div>
    </>
  );
}
