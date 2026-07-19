import { useEffect, useState } from "react";
import { Users, HeartHandshake, ListChecks, Gauge } from "lucide-react";
import { createMission, updateTask, getAnalytics } from "./api";
import Navbar from "./components/Navbar";
import StatCard from "./components/StatCard";
import RelayStepper from "./components/RelayStepper";
import MissionCard from "./components/MissionCard";
import MatchCard from "./components/MatchCard";
import "./style/style.css";

export default function App() {
  const [description, setDescription] = useState("");
  const [mission, setMission] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [requestedHelpers, setRequestedHelpers] = useState([]);

  useEffect(() => {
    getAnalytics().then(setAnalytics).catch(() => {});
  }, []);

  const handleExecute = async () => {
    if (description.trim().length < 10) {
      setError("Tell us a little more about the need — at least a sentence helps us route it well.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const result = await createMission(description);
      setMission(result.mission);
      setRequestedHelpers([]);
    } catch (err) {
      setError(err.message || "Something went wrong reaching the dispatch engine.");
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteTask = (taskId) => {
    setMission((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === taskId ? { ...t, status: "Completed" } : t)),
    }));
    updateTask(taskId, "Completed").catch(() => {});
  };

  const handleRequestHelp = (helperId) => {
    setRequestedHelpers((prev) => (prev.includes(helperId) ? prev : [...prev, helperId]));
  };

  const totalTasks = mission?.tasks?.length || 0;
  const completedTasks = mission?.tasks?.filter((t) => t.status === "Completed").length || 0;
  const progressPercent = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const resolved = mission && totalTasks > 0 && progressPercent === 100;
  const inMotion = requestedHelpers.length > 0 || completedTasks > 0;

  let stageIndex = 0;
  if (mission) stageIndex = resolved ? 4 : inMotion ? 3 : 2;

  return (
    <div className="app-shell">
      <Navbar />

      {!mission ? (
        <section className="hero">
          <div className="hero-inner">
            <span className="hero-eyebrow">AI dispatch engine</span>
            <h1>
              Describe the need. <em>We'll route the help.</em>
            </h1>
            <p className="hero-sub">
              Type what's happening in plain words — Sahaara reads it, builds an action plan, and
              matches it to the right helpers nearby.
            </p>

            <div className="hero-input-wrap">
              <textarea
                className="hero-input"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. An elderly neighbor needs a ride to her dialysis appointment tomorrow morning and can't drive herself."
              />
              <button className="cta-btn" onClick={handleExecute} disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner" /> Routing…
                  </>
                ) : (
                  "Execute analysis"
                )}
              </button>
              {error && <p className="hero-error">{error}</p>}
            </div>
          </div>
        </section>
      ) : (
        <section className="dashboard">
          {analytics && (
            <div className="stats-strip">
              <StatCard icon={<Users size={18} />} value={analytics.people_helped} label="People helped" />
              <StatCard icon={<HeartHandshake size={18} />} value={analytics.active_helpers} label="Active helpers" />
              <StatCard icon={<ListChecks size={18} />} value={analytics.tasks_completed} label="Tasks completed" />
              <StatCard icon={<Gauge size={18} />} value={analytics.impact_rating} label="Impact rating" />
            </div>
          )}

          <RelayStepper stageIndex={stageIndex} progressPercent={progressPercent} />

          <div className="content-grid">
            <MissionCard mission={mission} onCompleteTask={handleCompleteTask} progressPercent={progressPercent} />

            <div className="matches-stack">
              {mission.matches.map((helper, i) => (
                <MatchCard
                  key={helper.id}
                  helper={helper}
                  rank={i + 1}
                  requested={requestedHelpers.includes(helper.id)}
                  onRequestHelp={handleRequestHelp}
                />
              ))}
            </div>
          </div>

          {resolved && (
            <div className="resolved-banner">
              <HeartHandshake size={26} />
              <div>
                <h3>Mission resolved</h3>
                <p>Every task on the action plan is complete. Great work carrying this through.</p>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}