import { useState, type KeyboardEvent } from "react";

interface MessageInputProps {
  onSend: (message: string) => void;
  placeholder?: string;
}

export const MessageInput = ({
  onSend,
  placeholder = "Type your message here... (Press Enter to send, Shift+Enter for new line)",
}: MessageInputProps) => {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (!message.trim()) return;
    onSend(message);
    setMessage("");
  };

  const handleKeyPress = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="w-full">
      <div className="relative backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder={placeholder}
          rows={4}
          className="w-full bg-transparent text-white placeholder-white/40 resize-none outline-none pr-16"
        />
        <button
          onClick={handleSend}
          disabled={!message.trim()}
          className="absolute bottom-6 right-6 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-4 h-4"
          >
            <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
          </svg>
        </button>
      </div>
      <p className="text-white/40 text-xs text-center mt-3">
        Claude can make mistakes. Please verify important information.
      </p>
    </div>
  );
};
