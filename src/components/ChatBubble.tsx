import { motion } from "framer-motion";
import { EmotionBadge } from "./EmotionBadge";
import ReactMarkdown from "react-markdown";

interface ChatBubbleProps {
  role: "user" | "assistant";
  content: string;
  emotion?: string | null;
  emotionIntensity?: string | null;
}

export function ChatBubble({ role, content, emotion, emotionIntensity }: ChatBubbleProps) {
  const isUser = role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`flex flex-col ${isUser ? "items-end" : "items-start"} mb-3`}
    >
      {emotion && (
        <div className={`mb-1 ${isUser ? "mr-1" : "ml-1"}`}>
          <EmotionBadge emotion={emotion} intensity={emotionIntensity || undefined} />
        </div>
      )}
      <div
        className={`max-w-[80%] px-4 py-3 text-sm leading-relaxed ${
          isUser ? "chat-bubble-user" : "chat-bubble-bot"
        }`}
      >
        <div className="prose prose-sm max-w-none [&>p]:m-0">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </div>
    </motion.div>
  );
}
