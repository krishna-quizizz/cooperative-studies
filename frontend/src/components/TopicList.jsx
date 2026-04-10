function TopicList({ topics, selectedId, onSelect }) {
  return (
    <div className="topic-list">
      <h2>Discussion Topics</h2>
      {topics.map((topic) => (
        <div
          key={topic.id}
          className={`topic-item ${selectedId === topic.id ? 'active' : ''}`}
          onClick={() => onSelect(topic)}
        >
          <div className="category">{topic.category}</div>
          <div className="title">{topic.title}</div>
        </div>
      ))}
    </div>
  );
}

export default TopicList;
