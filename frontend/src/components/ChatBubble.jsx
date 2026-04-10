import { memo } from 'react';

const ChatBubble = memo(function ChatBubble({ speaker, text, isAlert, roles }) {
  const isAi = speaker === 'AI_agent';
  const role = roles?.find((r) => r.student_label === speaker);
  const displayName = isAi ? 'AI Moderator' : role ? `${role.role_name} (${speaker.replace('_', ' ')})` : speaker.replace('_', ' ');

  return (
    <div className={`chat-bubble ${isAi ? 'ai' : ''} ${isAlert ? 'alert' : ''}`}>
      <div className="speaker-name">{displayName}</div>
      <div className="message-text">{text}</div>
    </div>
  );
});

export default ChatBubble;
