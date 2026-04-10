import { useState } from 'react';
import DiscussionFeed from './DiscussionFeed';

function StatusIcon({ status }) {
  if (status === 'alerted') {
    return (
      <svg className="table-card-icon alerted" viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    );
  }

  // Gear/cog icon for idle and active
  return (
    <svg className={`table-card-icon ${status}`} viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  );
}

function TableCard({ tableId, roles, messages, currentSpeaker, currentText, alerts }) {
  const [expanded, setExpanded] = useState(false);

  const hasAlert = alerts.length > 0;
  const isActive = currentSpeaker != null;

  let status = 'idle';
  if (hasAlert) status = 'alerted';
  else if (isActive) status = 'active';

  return (
    <div className={`table-card ${status}`}>
      <div className="table-card-header" onClick={() => setExpanded(!expanded)}>
        <StatusIcon status={status} />
        <div className="table-card-info">
          <span className="table-card-label">Table {tableId}</span>
          <span className="table-card-count">{roles.length} students</span>
        </div>
        {hasAlert && (
          <span className="table-card-alert-badge">Alerted</span>
        )}
        <span className={`table-card-chevron ${expanded ? 'open' : ''}`}>&#9662;</span>
      </div>

      <div className="table-card-students">
        {roles.map((role) => (
          <span
            key={role.student_label}
            className={`table-card-student ${currentSpeaker === role.student_label ? 'speaking' : ''}`}
          >
            <span className={`status-dot ${currentSpeaker === role.student_label ? 'speaking' : 'idle'}`} />
            {role.student_label.replace('_', ' ')}
            <span className="table-card-role">{role.role_name}</span>
          </span>
        ))}
      </div>

      <div className={`table-card-expand ${expanded ? 'open' : ''}`}>
        {expanded && (
          <>
            {alerts.length > 0 && (
              <div className="alert-panel" style={{ marginBottom: '0.75rem' }}>
                <h3>Alerts ({alerts.length})</h3>
                {alerts.map((a, i) => (
                  <div className="alert-item" key={i}>
                    <strong>{a.speaker === 'AI_agent' ? 'AI Moderator' : a.speaker}:</strong> {a.text}
                  </div>
                ))}
              </div>
            )}
            <DiscussionFeed
              messages={messages}
              currentText={currentText}
              currentSpeaker={currentSpeaker}
              roles={roles}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default TableCard;
