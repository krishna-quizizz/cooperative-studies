import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { getSession, subscribeToSession, controlSession } from '../api';
import StudentTable from '../components/StudentTable';
import AlertBadge from '../components/AlertBadge';
import DiscussionFeed from '../components/DiscussionFeed';

function TeacherDashboard() {
  const { sessionId } = useParams();
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentSpeaker, setCurrentSpeaker] = useState(null);
  const [currentText, setCurrentText] = useState('');
  const [lastMessages, setLastMessages] = useState({});
  const [alerts, setAlerts] = useState([]);
  const [streaming, setStreaming] = useState(false);

  useEffect(() => {
    getSession(sessionId).then(setSession);
  }, [sessionId]);

  const handleStart = async () => {
    await controlSession(sessionId, 'start');
    setStreaming(true);

    subscribeToSession(sessionId, (event, data) => {
      switch (event) {
        case 'speaker':
          setCurrentSpeaker(data.speaker);
          setCurrentText('');
          break;
        case 'word':
          setCurrentText((prev) => (prev ? prev + ' ' + data.word : data.word));
          break;
        case 'line_complete':
          setMessages((prev) => [...prev, { speaker: data.speaker, text: data.text, is_alert: data.is_alert }]);
          setLastMessages((prev) => ({ ...prev, [data.speaker]: data.text }));
          setCurrentSpeaker(null);
          setCurrentText('');
          if (data.is_alert) {
            setAlerts((prev) => [...prev, { speaker: data.speaker, text: data.text }]);
          }
          break;
        case 'done':
          setStreaming(false);
          setCurrentSpeaker(null);
          break;
      }
    });
  };

  if (!session) {
    return (
      <div className="loading" style={{ padding: '2rem' }}>
        <div className="spinner" />
        <span>Loading session...</span>
      </div>
    );
  }

  return (
    <>
      <header className="app-header">
        <h1>Teacher Dashboard</h1>
        <span className="badge">{session.topic.title}</span>
      </header>
      <div className="teacher-dashboard">
        {!streaming && messages.length === 0 && (
          <div style={{ marginBottom: '1rem' }}>
            <button className="btn btn-success" onClick={handleStart}>
              Start Discussion
            </button>
          </div>
        )}

        <AlertBadge alerts={alerts} />

        <h2>Students</h2>
        <StudentTable
          roles={session.roles}
          currentSpeaker={currentSpeaker}
          lastMessages={lastMessages}
        />

        <h2>Discussion Transcript</h2>
        <DiscussionFeed
          messages={messages}
          currentText={currentText}
          currentSpeaker={currentSpeaker}
          roles={session.roles}
        />
      </div>
    </>
  );
}

export default TeacherDashboard;
