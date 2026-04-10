import { useRef, useEffect } from 'react';
import ChatBubble from './ChatBubble';

function DiscussionFeed({ messages, currentText, currentSpeaker, roles }) {
  const feedRef = useRef(null);

  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [messages, currentText]);

  return (
    <div className="discussion-feed" ref={feedRef}>
      {messages.map((msg, i) => (
        <ChatBubble
          key={i}
          speaker={msg.speaker}
          text={msg.text}
          isAlert={msg.is_alert}
          roles={roles}
        />
      ))}
      {currentSpeaker && currentText && (
        <ChatBubble
          speaker={currentSpeaker}
          text={currentText}
          isAlert={false}
          roles={roles}
        />
      )}
    </div>
  );
}

export default DiscussionFeed;
