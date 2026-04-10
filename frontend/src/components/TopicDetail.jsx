import RoleCard from './RoleCard';

function TopicDetail({ topic, roles, onGenerate, onStart, generating, sessionId }) {
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
        <div className="loading">
          <div className="spinner" />
          <span>Claude is generating roles and discussion script...</span>
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
