const STAGES = ["Received", "AI Analysis", "Helpers Matched", "In Motion", "Resolved"];

function RelayStepper({ stageIndex, progressPercent }) {
  const fillPercent = (stageIndex / (STAGES.length - 1)) * 90 + 5;

  return (
    <div className="relay">
      <div className="relay-heading">
        <h3>Mission relay</h3>
        <span className="relay-percent">{progressPercent}% complete</span>
      </div>

      <div className="relay-track">
        <div className="relay-line" />
        <div className="relay-fill" style={{ width: `${fillPercent}%` }} />

        {STAGES.map((stage, i) => (
          <div
            key={stage}
            className={
              i < stageIndex ? "relay-node done" : i === stageIndex ? "relay-node active" : "relay-node"
            }
          >
            <div className="relay-dot" />
            <span className="relay-label">{stage}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RelayStepper;