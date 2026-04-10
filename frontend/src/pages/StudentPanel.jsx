import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { getSession } from '../api';
import { useSessionState } from '../context/SessionContext';
import SeatingArrangement from '../components/SeatingArrangement';
import DiscussionFeed from '../components/DiscussionFeed';

function StudentPanel() {
  const { sessionId, tableId } = useParams();
  const [session, setSession] = useState(null);
  const { state, ensureSubscribed } = useSessionState(sessionId);

  useEffect(() => {
    getSession(sessionId).then(setSession);
  }, [sessionId]);

  useEffect(() => {
    if (!session) return;
    ensureSubscribed(sessionId);
  }, [session, sessionId, ensureSubscribed]);

  const tid = tableId ? Number(tableId) : null;

  const filteredRoles = useMemo(() => {
    if (!session) return [];
    if (!tid) return session.roles;
    return session.roles.filter((r) => r.table_id === tid);
  }, [session, tid]);

  const speakerSet = useMemo(
    () => new Set(filteredRoles.map((r) => r.student_label)),
    [filteredRoles],
  );

  const filteredMessages = useMemo(() => {
    if (!tid) return state.messages;
    return state.messages.filter(
      (msg) => msg.table_id === tid || (msg.speaker === 'AI_agent' && msg.table_id === tid),
    );
  }, [state.messages, tid]);

  const activeSpeaker =
    tid && state.currentTableId === tid ? state.currentSpeaker : (!tid ? state.currentSpeaker : null);
  const activeText =
    tid && state.currentTableId === tid ? state.currentText : (!tid ? state.currentText : '');

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
        <h1>Group Discussion{tid ? ` — Group ${tid}` : ''}</h1>
        <span className="badge">{session.topic.title}</span>
      </div>
      <div className="student-panel">
        <SeatingArrangement
          roles={filteredRoles}
          currentSpeaker={activeSpeaker}
        />
        <DiscussionFeed
          messages={filteredMessages}
          currentText={activeText}
          currentSpeaker={activeSpeaker}
          roles={filteredRoles}
        />
      </div>
    </div>
  );
}

export default StudentPanel;
