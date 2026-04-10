import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getSession } from '../api';
import { useSessionState } from '../context/SessionContext';
import SeatingArrangement from '../components/SeatingArrangement';
import DiscussionFeed from '../components/DiscussionFeed';

function StudentPanel() {
  const { sessionId } = useParams();
  const [session, setSession] = useState(null);
  const { state, ensureSubscribed } = useSessionState(sessionId);

  useEffect(() => {
    getSession(sessionId).then(setSession);
  }, [sessionId]);

  useEffect(() => {
    if (!session) return;
    ensureSubscribed(sessionId);
  }, [session, sessionId, ensureSubscribed]);

  if (!session) {
    return (
      <div className="loading" style={{ padding: '2rem' }}>
        <div className="spinner" />
        <span>Loading session...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1>Group Discussion</h1>
        <span className="badge">{session.topic.title}</span>
      </div>
      <div className="student-panel">
        <SeatingArrangement
          roles={session.roles}
          currentSpeaker={state.currentSpeaker}
        />
        <DiscussionFeed
          messages={state.messages}
          currentText={state.currentText}
          currentSpeaker={state.currentSpeaker}
          roles={session.roles}
        />
      </div>
    </div>
  );
}

export default StudentPanel;
