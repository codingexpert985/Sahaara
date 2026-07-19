import { Sparkles, Target } from "lucide-react";
import TaskCard from "./TaskCard";

function MissionCard({ mission, onCompleteTask, progressPercent }) {
  return (
    <div className="mission-card">
      <div className="panel ai-panel">
        <div className="panel-header">
          <div>
            <span className="panel-kicker">AI understanding</span>
            <h2>{mission.title}</h2>
          </div>
          <Sparkles size={20} />
        </div>

        <p className="mission-quote">"{mission.description}"</p>

        <div className="analysis-grid">
          <div className="analysis-item">
            <span>Category</span>
            <strong>{mission.category}</strong>
          </div>
          <div className="analysis-item">
            <span>Urgency</span>
            <strong className={mission.urgency === "Critical" ? "critical" : "high"}>
              {mission.urgency}
            </strong>
          </div>
          <div className="analysis-item">
            <span>Beneficiary</span>
            <strong>{mission.beneficiary}</strong>
          </div>
        </div>

        <div className="resource-section">
          <span className="panel-kicker">Resources needed</span>
          <div className="tag-list">
            {mission.resources.map((resource) => (
              <span className="tag" key={resource}>
                {resource}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <div>
            <span className="panel-kicker">Action plan</span>
            <h2>Make progress together</h2>
          </div>
          <Target size={20} />
        </div>

        <div className="task-list">
          {mission.tasks.map((task) => (
            <TaskCard key={task.id} task={task} onComplete={onCompleteTask} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default MissionCard;