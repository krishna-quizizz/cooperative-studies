import { NavLink, useLocation } from 'react-router-dom';

function Sidebar() {
  const location = useLocation();
  const sessionMatch = location.pathname.match(/\/(?:teacher|student)\/session\/(.+)/);
  const sessionId = sessionMatch ? sessionMatch[1] : null;

  return (
    <nav className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-logo">CS</div>
        <span>Cooperative Studies</span>
      </div>

      <div className="sidebar-nav">
        <NavLink to="/" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} end>
          <span className="sidebar-icon">&#9776;</span>
          Topics
        </NavLink>

        {sessionId && (
          <>
            <div className="sidebar-section">Session</div>
            <NavLink
              to={`/teacher/session/${sessionId}`}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <span className="sidebar-icon">&#9733;</span>
              Teacher View
            </NavLink>
            <NavLink
              to={`/student/session/${sessionId}`}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <span className="sidebar-icon">&#9829;</span>
              Student View
            </NavLink>
          </>
        )}
      </div>

      <div className="sidebar-footer">
        <em>Group Discussion Platform</em>
      </div>
    </nav>
  );
}

export default Sidebar;
