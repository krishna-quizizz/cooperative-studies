function AlertBadge({ alerts }) {
  if (alerts.length === 0) return null;

  return (
    <div className="alert-panel">
      <h3>AI Agent Alerts ({alerts.length})</h3>
      {alerts.map((alert, i) => (
        <div className="alert-item" key={i}>
          <strong>{alert.speaker === 'AI_agent' ? 'AI Moderator' : alert.speaker}:</strong>{' '}
          {alert.text}
        </div>
      ))}
    </div>
  );
}

export default AlertBadge;
