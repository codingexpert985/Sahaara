import { MapPin, Clock3, ShieldCheck, CheckCircle2, ArrowRight } from "lucide-react";

function MatchCard({ helper, rank, requested, onRequestHelp }) {
  return (
    <div className={rank === 1 ? "match-card best-match" : "match-card"}>
      <div className="match-rank">#{rank}</div>

      <div className="avatar">{helper.name.charAt(0)}</div>

      <div className="helper-info">
        <h3>{helper.name}</h3>
        <p>{helper.skills}</p>
        <div className="helper-meta">
          <span>
            <MapPin size={14} />
            {helper.location}
          </span>
          <span>
            <Clock3 size={14} />
            {helper.availability}
          </span>
          <span>
            <ShieldCheck size={14} />
            {helper.reliability}% reliable
          </span>
        </div>
      </div>

      <div className="score-box">
        <strong>{helper.match_score}%</strong>
        <span>MATCH</span>
      </div>

      <div className="match-reasons">
        {helper.reasons.map((reason) => (
          <span key={reason}>
            <CheckCircle2 size={14} />
            {reason}
          </span>
        ))}
      </div>

      <button
        className={requested ? "primary-button requested" : "primary-button"}
        onClick={() => onRequestHelp(helper.id)}
        disabled={requested}
      >
        {requested ? (
          <>
            <CheckCircle2 size={16} /> Request sent
          </>
        ) : (
          <>
            Ask to help
            <ArrowRight size={16} />
          </>
        )}
      </button>
    </div>
  );
}

export default MatchCard;