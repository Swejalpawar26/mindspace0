export function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-3 chat-bubble-bot w-fit">
      <div className="w-2 h-2 rounded-full bg-current animate-typing-dot-1" />
      <div className="w-2 h-2 rounded-full bg-current animate-typing-dot-2" />
      <div className="w-2 h-2 rounded-full bg-current animate-typing-dot-3" />
    </div>
  );
}
