import { createContext, useContext, useRef, useState, useCallback, useEffect } from 'react';
import { subscribeToSession } from '../api';

const SessionContext = createContext(null);

const FLUSH_INTERVAL_MS = 250;

const EMPTY_STATE = {
  messages: [],
  currentSpeaker: null,
  currentTableId: null,
  currentText: '',
  started: false,
};

export function SessionProvider({ children }) {
  const [sessionStates, setSessionStates] = useState({});
  const sourcesRef = useRef({});
  // Accumulates word events between flushes so we don't re-render per word
  const pendingWordsRef = useRef({});

  useEffect(() => {
    const id = setInterval(() => {
      const pending = pendingWordsRef.current;
      const sessionIds = Object.keys(pending);
      if (sessionIds.length === 0) return;

      pendingWordsRef.current = {};
      setSessionStates((prev) => {
        const next = { ...prev };
        for (const sid of sessionIds) {
          const cur = next[sid] ?? { ...EMPTY_STATE, started: true };
          next[sid] = {
            ...cur,
            currentText: cur.currentText
              ? cur.currentText + ' ' + pending[sid]
              : pending[sid],
          };
        }
        return next;
      });
    }, FLUSH_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  const getState = useCallback(
    (sessionId) => sessionStates[sessionId] ?? EMPTY_STATE,
    [sessionStates],
  );

  const ensureSubscribed = useCallback((sessionId) => {
    if (sourcesRef.current[sessionId]) return;

    const source = subscribeToSession(sessionId, (event, data) => {
      switch (event) {
        case 'speaker':
          setSessionStates((prev) => {
            const cur = prev[sessionId] ?? { ...EMPTY_STATE, started: true };
            return {
              ...prev,
              [sessionId]: { ...cur, currentSpeaker: data.speaker, currentTableId: data.table_id, currentText: '' },
            };
          });
          break;

        case 'word': {
          const prev = pendingWordsRef.current[sessionId];
          pendingWordsRef.current[sessionId] = prev ? prev + ' ' + data.word : data.word;
          break;
        }

        case 'line_complete':
          // Flush any pending words immediately so they aren't lost
          pendingWordsRef.current[sessionId] = undefined;
          setSessionStates((prev) => {
            const cur = prev[sessionId] ?? { ...EMPTY_STATE, started: true };
            return {
              ...prev,
              [sessionId]: {
                ...cur,
                messages: [...cur.messages, { speaker: data.speaker, text: data.text, is_alert: data.is_alert, table_id: data.table_id }],
                currentSpeaker: null,
                currentTableId: null,
                currentText: '',
              },
            };
          });
          break;

        case 'done':
          setSessionStates((prev) => {
            const cur = prev[sessionId] ?? { ...EMPTY_STATE, started: true };
            return { ...prev, [sessionId]: { ...cur, currentSpeaker: null } };
          });
          break;
      }
    });

    sourcesRef.current[sessionId] = source;

    setSessionStates((prev) => ({
      ...prev,
      [sessionId]: prev[sessionId]
        ? { ...prev[sessionId], started: true }
        : { ...EMPTY_STATE, started: true },
    }));
  }, []);

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
