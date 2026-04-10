function StudentTable({ roles, currentSpeaker, lastMessages }) {
  return (
    <table className="student-table">
      <thead>
        <tr>
          <th>Student</th>
          <th>Role</th>
          <th>Status</th>
          <th>Last Message</th>
        </tr>
      </thead>
      <tbody>
        {roles.map((role) => {
          const isSpeaking = currentSpeaker === role.student_label;
          const lastMsg = lastMessages[role.student_label] || '—';
          return (
            <tr key={role.student_label} className={isSpeaking ? 'speaking' : ''}>
              <td>{role.student_label.replace('_', ' ')}</td>
              <td>{role.role_name}</td>
              <td>
                <span className={`status-dot ${isSpeaking ? 'speaking' : 'idle'}`} />
                {isSpeaking ? 'Speaking' : 'Idle'}
              </td>
              <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {lastMsg}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default StudentTable;
