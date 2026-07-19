import { CheckCircle2 } from "lucide-react";

function TaskCard({ task, onComplete }) {
  const completed = task.status === "Completed";

  return (
    <div className={completed ? "task completed" : "task"}>
      <button
        className="task-check"
        onClick={() => !completed && onComplete(task.id)}
        aria-label={completed ? "Task completed" : "Mark task complete"}
      >
        {completed ? <CheckCircle2 size={14} /> : <span />}
      </button>
      <span>{task.title}</span>
    </div>
  );
}

export default TaskCard;