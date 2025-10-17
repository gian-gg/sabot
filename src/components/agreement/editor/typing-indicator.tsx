// Typing Indicator Component
// Shows "User is typing..." indicator for active collaborators

interface TypingIndicatorProps {
  userName: string;
  userColor: string;
  isTyping: boolean;
}

export default function TypingIndicator({
  userName,
  userColor,
  isTyping,
}: TypingIndicatorProps) {
  // TODO: Replace with v0-generated component
  if (!isTyping) return null;

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '4px 8px',
        backgroundColor: '#181818',
        borderRadius: '4px',
        fontSize: '12px',
        color: userColor,
      }}
    >
      <span>{userName} is typing</span>
      <span className="animate-pulse">...</span>
    </div>
  );
}
