import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getSession, subscribeToSession } from '../api';
import SeatingArrangement from '../components/SeatingArrangement';
import DiscussionFeed from '../components/DiscussionFeed';

function StudentPanel() {
  const { sessionId } = useParams();
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentSpeaker, setCurrentSpeaker] = useState(null);
  const [currentText, setCurrentText] = useState('');
  const [started, setStarted] = useState(false);

  useEffect(() => {
    getSession(sessionId).then(setSession);
  }, [sessionId]);

  useEffect(() => {
    if (!session || started) return;
    setStarted(true);

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
          setCurrentSpeaker(null);
          setCurrentText('');
          break;
        case 'done':
          setCurrentSpeaker(null);
          break;
      }
    });
  }, [session, sessionId, started]);

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
        <h1>Group Discussion</h1>
        <span className="badge">{session.topic.title}</span>
      </header>
      <div className="student-panel">
        <SeatingArrangement
          roles={session.roles}
          currentSpeaker={currentSpeaker}
        />
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

export default StudentPanel;
