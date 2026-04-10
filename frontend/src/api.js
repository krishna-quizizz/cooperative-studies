const BASE = '/api';

export async function fetchTopics() {
  const res = await fetch(`${BASE}/topics`);
  return res.json();
}

export async function fetchTopic(topicId) {
  const res = await fetch(`${BASE}/topics/${topicId}`);
  return res.json();
}

export async function generateTasks(topicId, groupSize = 4) {
  const res = await fetch(`${BASE}/generate-tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic_id: topicId, group_size: groupSize }),
  });
  return res.json();
}

export async function createSession(topicId, roles, script) {
  const res = await fetch(`${BASE}/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic_id: topicId, roles, script }),
  });
  return res.json();
}

export async function getSession(sessionId) {
  const res = await fetch(`${BASE}/sessions/${sessionId}`);
  return res.json();
}

export async function controlSession(sessionId, action) {
  const res = await fetch(`${BASE}/sessions/${sessionId}/control`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action }),
  });
  return res.json();
}

export function subscribeToSession(sessionId, onEvent) {
  const source = new EventSource(`${BASE}/sessions/${sessionId}/stream`);

  source.addEventListener('speaker', (e) => onEvent('speaker', JSON.parse(e.data)));
  source.addEventListener('word', (e) => onEvent('word', JSON.parse(e.data)));
  source.addEventListener('line_complete', (e) => onEvent('line_complete', JSON.parse(e.data)));
  source.addEventListener('done', () => { onEvent('done', {}); source.close(); });
  source.onerror = () => { source.close(); };

  return source;
}
