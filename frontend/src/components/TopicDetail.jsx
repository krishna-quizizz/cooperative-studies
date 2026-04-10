import { useState, useEffect } from 'react';
import RoleCard from './RoleCard';

const GENERATION_STEPS = [
  'Analyzing topic and building expert roles...',
  'Crafting discussion dynamics...',
  'Writing multi-table script...',
  'Finalizing roles and dialogue...',
];

function TopicDetail({ topic, roles, onGenerate, onStart, generating, sessionId }) {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (!generating) {
      setStepIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setStepIndex((prev) => (prev < GENERATION_STEPS.length - 1 ? prev + 1 : prev));
    }, 5000);
    return () => clearInterval(interval);
  }, [generating]);

  if (!topic) {
    return (
      <div className="topic-detail">
        <div className="empty">Select a topic from the left panel to begin</div>
      </div>
    );
  }

  return (
    <div className="topic-detail">
      <span className="category-badge">{topic.category}</span>
      <h2>{topic.title}</h2>
      <p className="description">{topic.description}</p>

      <div className="actions">
        <button
          className="btn btn-primary"
          onClick={onGenerate}
          disabled={generating}
        >
          {generating ? 'Generating...' : 'Generate Tasks'}
        </button>

        {roles.length > 0 && (
          <button className="btn btn-success" onClick={onStart}>
            Start Discussion
          </button>
        )}
      </div>

      {generating && (
        <div className="generation-progress">
          <div className="generation-progress-bar">
            <div
              className="generation-progress-fill"
              style={{ width: `${((stepIndex + 1) / GENERATION_STEPS.length) * 100}%` }}
            />
          </div>
          <div className="generation-steps">
            {GENERATION_STEPS.map((step, i) => (
              <div
                key={i}
                className={`generation-step ${i < stepIndex ? 'done' : ''} ${i === stepIndex ? 'active' : ''}`}
              >
                <span className="generation-step-icon">
                  {i < stepIndex ? '✓' : i === stepIndex ? '' : ''}
                </span>
                <span>{step}</span>
                {i === stepIndex && <span className="generation-step-spinner" />}
              </div>
            ))}
          </div>
          <p className="generation-eta">This usually takes 15–20 seconds</p>
        </div>
      )}

      {roles.length > 0 && (
        <div className="roles-grid">
          {roles.map((role, i) => (
            <RoleCard key={i} role={role} />
          ))}
        </div>
      )}

      {sessionId && (
        <div className="session-urls">
          <h3>Session Created!</h3>
          <div className="url-row">
            <span className="url-label">Teacher:</span>
            <a href={`/teacher/session/${sessionId}`} target="_blank" rel="noreferrer">
              /teacher/session/{sessionId}
            </a>
          </div>
          <div className="url-row">
            <span className="url-label">Student:</span>
            <a href={`/student/session/${sessionId}`} target="_blank" rel="noreferrer">
              /student/session/{sessionId}
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export default TopicDetail;
