function RoleCard({ role }) {
  return (
    <div className="role-card">
      <div className="student-label">{role.student_label.replace('_', ' ')}</div>
      <div className="role-name">{role.role_name}</div>
      <div className="task">{role.task}</div>
    </div>
  );
}

export default RoleCard;
