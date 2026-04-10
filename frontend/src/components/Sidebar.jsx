import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { getSession } from '../api';

function Sidebar() {
  const location = useLocation();
  const sessionMatch = location.pathname.match(/\/(?:teacher|student)\/session\/([^/]+)/);
  const sessionId = sessionMatch ? sessionMatch[1] : null;
  const [tableIds, setTableIds] = useState([]);

  useEffect(() => {
    if (!sessionId) {
      setTableIds([]);
      return;
    }
    getSession(sessionId).then((session) => {
      if (!session?.roles) return;
      const ids = [...new Set(session.roles.map((r) => r.table_id))].sort((a, b) => a - b);
      setTableIds(ids);
    });
  }, [sessionId]);

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

            {tableIds.length > 0 && (
              <>
                <div className="sidebar-section">Student Groups</div>
                {tableIds.map((tid) => (
                  <NavLink
                    key={tid}
                    to={`/student/session/${sessionId}/table/${tid}`}
                    className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                  >
                    <span className="sidebar-icon">&#9829;</span>
                    Group {tid}
                  </NavLink>
                ))}
              </>
            )}
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
