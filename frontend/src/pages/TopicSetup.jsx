import { useState, useEffect } from 'react';
import { fetchTopics, generateTasks, createSession } from '../api';
import TopicList from '../components/TopicList';
import TopicDetail from '../components/TopicDetail';

function TopicSetup() {
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [roles, setRoles] = useState([]);
  const [script, setScript] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [sessionId, setSessionId] = useState(null);

  useEffect(() => {
    fetchTopics().then(setTopics);
  }, []);

  const handleSelect = (topic) => {
    setSelectedTopic(topic);
    setRoles([]);
    setScript([]);
    setSessionId(null);
  };

  const handleGenerate = async () => {
    if (!selectedTopic) return;
    setGenerating(true);
    setSessionId(null);
    try {
      const data = await generateTasks(selectedTopic.id);
      setRoles(data.roles);
      setScript(data.script);
    } catch (err) {
      console.error('Generation failed:', err);
    } finally {
      setGenerating(false);
    }
  };

  const handleStart = async () => {
    if (!selectedTopic || roles.length === 0) return;
    try {
      const session = await createSession(selectedTopic.id, roles, script);
      setSessionId(session.id);
    } catch (err) {
      console.error('Session creation failed:', err);
    }
  };

  return (
    <>
      <header className="app-header">
        <h1>Cooperative Studies</h1>
        <span className="badge">Group Discussion Platform</span>
      </header>
      <div className="topic-setup">
        <TopicList
          topics={topics}
          selectedId={selectedTopic?.id}
          onSelect={handleSelect}
        />
        <TopicDetail
          topic={selectedTopic}
          roles={roles}
          onGenerate={handleGenerate}
          onStart={handleStart}
          generating={generating}
          sessionId={sessionId}
        />
      </div>
    </>
  );
}

export default TopicSetup;
