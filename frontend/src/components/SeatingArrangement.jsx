function SeatingArrangement({ roles, currentSpeaker }) {
  const radius = 150;
  const centerX = 200;
  const centerY = 200;

  return (
    <div className="seating-container">
      {/* Student seats in a circle */}
      {roles.map((role, i) => {
        const angle = (2 * Math.PI * i) / roles.length - Math.PI / 2;
        const x = centerX + radius * Math.cos(angle) - 35;
        const y = centerY + radius * Math.sin(angle) - 35;
        const isSpeaking = currentSpeaker === role.student_label;
        const initials = role.role_name.split(' ').map(w => w[0]).join('').slice(0, 2);

        return (
          <div
            key={role.student_label}
            className={`student-seat ${isSpeaking ? 'speaking' : ''}`}
            style={{ left: `${x}px`, top: `${y}px` }}
          >
            <div className="initials">{initials}</div>
            <div className="role">{role.role_name}</div>
          </div>
        );
      })}

      {/* AI Agent in center */}
      <div className={`ai-agent-avatar ${currentSpeaker === 'AI_agent' ? 'speaking' : ''}`}>
        <div className="ai-icon">AI</div>
        <div>Moderator</div>
      </div>
    </div>
  );
}

export default SeatingArrangement;
