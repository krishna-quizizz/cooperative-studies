import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { getSession, subscribeToSession, controlSession } from '../api';
import TableCard from '../components/TableCard';

const FLUSH_INTERVAL_MS = 250;

function groupByTable(roles) {
  const tables = {};
  for (const role of roles) {
    const tid = role.table_id || 1;
    if (!tables[tid]) tables[tid] = [];
    tables[tid].push(role);
  }
  return tables;
}

function TeacherDashboard() {
  const { sessionId } = useParams();
  const [session, setSession] = useState(null);
  const [streaming, setStreaming] = useState(false);
  const [tableState, setTableState] = useState({});
  const pendingWordsRef = useRef({});

  useEffect(() => {
    getSession(sessionId).then(setSession);
  }, [sessionId]);

  const tableGroups = useMemo(() => {
    if (!session) return {};
    return groupByTable(session.roles);
  }, [session]);

  useEffect(() => {
    if (!session) return;
    const initial = {};
    for (const tid of Object.keys(tableGroups)) {
      initial[tid] = { messages: [], currentSpeaker: null, currentText: '', alerts: [] };
    }
    setTableState(initial);
  }, [session, tableGroups]);

  // Periodic flush of accumulated word events
  useEffect(() => {
    const id = setInterval(() => {
      const pending = pendingWordsRef.current;
      const tids = Object.keys(pending);
      if (tids.length === 0) return;

      pendingWordsRef.current = {};
      setTableState((prev) => {
        const next = { ...prev };
        for (const tid of tids) {
          const ts = next[tid];
          if (!ts) continue;
          next[tid] = {
            ...ts,
            currentText: ts.currentText ? ts.currentText + ' ' + pending[tid] : pending[tid],
          };
        }
        return next;
      });
    }, FLUSH_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  const handleStart = useCallback(async () => {
    await controlSession(sessionId, 'start');
    setStreaming(true);

    subscribeToSession(sessionId, (event, data) => {
      const tid = data.table_id || 1;

      switch (event) {
        case 'speaker':
          setTableState((prev) => ({
            ...prev,
            [tid]: { ...prev[tid], currentSpeaker: data.speaker, currentText: '' },
          }));
          break;

        case 'word': {
          const prev = pendingWordsRef.current[tid];
          pendingWordsRef.current[tid] = prev ? prev + ' ' + data.word : data.word;
          break;
        }

        case 'line_complete':
          pendingWordsRef.current[tid] = undefined;
          setTableState((prev) => {
            const ts = prev[tid] || { messages: [], alerts: [] };
            const newMsg = { speaker: data.speaker, text: data.text, is_alert: data.is_alert };
            const newAlerts = data.is_alert
              ? [...ts.alerts, { speaker: data.speaker, text: data.text }]
              : ts.alerts;
            return {
              ...prev,
              [tid]: {
                ...ts,
                messages: [...ts.messages, newMsg],
                alerts: newAlerts,
                currentSpeaker: null,
                currentText: '',
              },
            };
          });
          break;

        case 'done':
          setStreaming(false);
          setTableState((prev) => {
            const next = { ...prev };
            for (const t of Object.keys(next)) {
              next[t] = { ...next[t], currentSpeaker: null };
            }
            return next;
          });
          break;
      }
    });
  }, [sessionId]);

  if (!session) {
    return (
      <div className="loading" style={{ padding: '2rem' }}>
        <div className="spinner" />
        <span>Loading session...</span>
      </div>
    );
  }

  const tableIds = Object.keys(tableGroups).sort((a, b) => a - b);

  return (
    <div className="teacher-dashboard">
      <div className="page-header">
        <h1>Teacher Dashboard</h1>
        <span className="badge">{session.topic.title}</span>
      </div>

      <div style={{ padding: '0 2rem 1.5rem' }}>
        {!streaming && Object.values(tableState).every((t) => t.messages.length === 0) && (
          <div style={{ marginBottom: '1.25rem' }}>
            <button className="btn btn-success" onClick={handleStart}>
              Start Discussion
            </button>
          </div>
        )}

        <div className="table-cards-grid">
          {tableIds.map((tid) => {
            const ts = tableState[tid] || { messages: [], currentSpeaker: null, currentText: '', alerts: [] };
            return (
              <TableCard
                key={tid}
                tableId={tid}
                roles={tableGroups[tid]}
                messages={ts.messages}
                currentSpeaker={ts.currentSpeaker}
                currentText={ts.currentText}
                alerts={ts.alerts}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default TeacherDashboard;
