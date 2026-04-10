import { createContext, useContext, useRef, useState, useCallback } from 'react';
import { subscribeToSession } from '../api';

const SessionContext = createContext(null);

export function SessionProvider({ children }) {
  // Keyed by sessionId: { messages, currentSpeaker, currentText, started }
  const [sessionStates, setSessionStates] = useState({});
  // Keyed by sessionId: EventSource instance (so we don't double-subscribe)
  const sourcesRef = useRef({});

  const getState = useCallback(
    (sessionId) =>
      sessionStates[sessionId] ?? {
        messages: [],
        currentSpeaker: null,
        currentText: '',
        started: false,
      },
    [sessionStates]
  );

  const ensureSubscribed = useCallback(
    (sessionId) => {
      if (sourcesRef.current[sessionId]) return;

      const source = subscribeToSession(sessionId, (event, data) => {
        setSessionStates((prev) => {
          const cur = prev[sessionId] ?? { messages: [], currentSpeaker: null, currentText: '', started: true };

          switch (event) {
            case 'speaker':
              return { ...prev, [sessionId]: { ...cur, currentSpeaker: data.speaker, currentText: '' } };

            case 'word':
              return {
                ...prev,
                [sessionId]: {
                  ...cur,
                  currentText: cur.currentText ? cur.currentText + ' ' + data.word : data.word,
                },
              };

            case 'line_complete':
              return {
                ...prev,
                [sessionId]: {
                  ...cur,
                  messages: [...cur.messages, { speaker: data.speaker, text: data.text, is_alert: data.is_alert }],
                  currentSpeaker: null,
                  currentText: '',
                },
              };

            case 'done':
              return { ...prev, [sessionId]: { ...cur, currentSpeaker: null } };

            default:
              return prev;
          }
        });
      });

      sourcesRef.current[sessionId] = source;

      setSessionStates((prev) => ({
        ...prev,
        [sessionId]: prev[sessionId]
          ? { ...prev[sessionId], started: true }
          : { messages: [], currentSpeaker: null, currentText: '', started: true },
      }));
    },
    []
  );

  return (
    <SessionContext.Provider value={{ getState, ensureSubscribed }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSessionState(sessionId) {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSessionState must be used inside SessionProvider');
  const { getState, ensureSubscribed } = ctx;
  return { state: getState(sessionId), ensureSubscribed };
}
