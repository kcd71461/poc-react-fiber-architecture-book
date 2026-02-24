interface BlockingVsYieldingTimelineProps {
  frameBudgetMs: number;
  stackTaskMs: number;
  fiberSliceMs: number;
}

function toPercent(ms: number, budgetMs: number) {
  return Math.min((ms / budgetMs) * 100, 100);
}

export function BlockingVsYieldingTimeline({
  frameBudgetMs,
  stackTaskMs,
  fiberSliceMs,
}: BlockingVsYieldingTimelineProps) {
  const stackWidth = toPercent(stackTaskMs, frameBudgetMs);
  const fiberWidth = toPercent(fiberSliceMs, frameBudgetMs);

  return (
    <div className="rf-callout">
      <strong>Frame Budget Simulation ({frameBudgetMs}ms)</strong>
      <div className="rf-bars">
        <div className="rf-bar-row">
          <span>Stack</span>
          <div className="rf-bar stack" style={{ width: `${stackWidth}%` }} />
        </div>
        <div className="rf-bar-row">
          <span>Fiber</span>
          <div className="rf-bar" style={{ width: `${fiberWidth}%` }} />
        </div>
      </div>
      <p className="rf-small">
        Stack은 긴 작업이 프레임 예산을 한 번에 초과하기 쉽고, Fiber는 작업을 slice로
        나눠 브라우저에 제어권을 반환할 수 있습니다.
      </p>
    </div>
  );
}
