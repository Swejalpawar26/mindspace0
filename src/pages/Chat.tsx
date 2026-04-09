import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import { ChatBubble } from "@/components/ChatBubble";
import { StoryFlashCard } from "@/components/StoryFlashCard";
import { TypingIndicator } from "@/components/TypingIndicator";
import { CrisisAlert, detectCrisis } from "@/components/CrisisAlert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id?: string;
  role: "user" | "assistant";
  content: string;
  emotion?: string | null;
  emotion_intensity?: string | null;
  character_quote?: string | null;
  character_name?: string | null;
  character_story?: string | null;
}

export default function Chat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [showCrisisAlert, setShowCrisisAlert] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    loadHistory();
  }, [user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const loadHistory = async () => {
    const { data } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: true })
      .limit(50);

    if (data) {
      setMessages(data.map((m: any) => ({
        id: m.id,
        role: m.role as "user" | "assistant",
        content: m.content,
        emotion: m.emotion,
        emotion_intensity: m.emotion_intensity,
      })));
    }
    setLoadingHistory(false);
  };

  const saveMessage = async (msg: Message) => {
    await supabase.from("chat_messages").insert({
      user_id: user!.id,
      role: msg.role,
      content: msg.content,
      emotion: msg.emotion || null,
      emotion_intensity: msg.emotion_intensity || null,
    });
  };

  const sendMessage = async () => {
    if (!input.trim() || isTyping) return;

    const text = input.trim();

    if (detectCrisis(text)) {
      setShowCrisisAlert(true);
    }

    const userMessage: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const recentMessages = [...messages.slice(-10), userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mental-health-chat`;

      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: recentMessages }),
      });

      if (!resp.ok) throw new Error("Failed to get response");

      const data = await resp.json();

      const botMessage: Message = {
        role: "assistant",
        content: data.reply,
        emotion: data.emotion || null,
        emotion_intensity: data.emotion_intensity || null,
        character_quote: data.character_quote || null,
        character_name: data.character_name || null,
        character_story: data.character_story || null,
      };

      const userWithEmotion = { ...userMessage, emotion: data.emotion, emotion_intensity: data.emotion_intensity };
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = userWithEmotion;
        return [...updated, botMessage];
      });

      await saveMessage(userWithEmotion);
      await saveMessage(botMessage);

      if (data.emotion && data.emotion !== "neutral") {
        await supabase.from("mood_entries").insert({
          user_id: user!.id,
          mood: data.emotion,
          intensity: data.emotion_intensity || "medium",
          note: userMessage.content.slice(0, 200),
        });
      }
    } catch (error) {
      const errorMsg: Message = {
        role: "assistant",
        content: "I'm having trouble connecting right now. Take a deep breath, and try again in a moment. 🌿",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-full">
        <div className="px-4 md:px-6 py-3 border-b border-border bg-card/30">
          <h2 className="font-bold text-foreground">MindSpace Chat</h2>
          <p className="text-xs text-muted-foreground">Your safe space to talk 💙</p>
        </div>

        <AnimatePresence>
          {showCrisisAlert && <CrisisAlert onDismiss={() => setShowCrisisAlert(false)} />}
        </AnimatePresence>

        <div className="flex-1 overflow-y-auto px-3 md:px-4 py-4">
          {loadingHistory ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-full text-center px-4"
            >
              <div className="w-20 h-20 rounded-full gradient-calm flex items-center justify-center mb-4">
                <span className="text-3xl">🧠</span>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Hey there! 👋</h3>
              <p className="text-muted-foreground max-w-sm text-sm">
                I'm here to listen and support you. Share what's on your mind — no judgment, just care.
              </p>
            </motion.div>
          ) : (
            messages.map((msg, i) => (
              <div key={i}>
                <ChatBubble
                  role={msg.role}
                  content={msg.content}
                  emotion={msg.emotion}
                  emotionIntensity={msg.emotion_intensity}
                />
                {msg.role === "assistant" && msg.character_quote && msg.character_name && (
                  <StoryFlashCard
                    quote={msg.character_quote}
                    character={msg.character_name}
                    story={msg.character_story || ""}
                  />
                )}
              </div>
            ))
          )}
          {isTyping && (
            <div className="flex items-start mb-3">
              <TypingIndicator />
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="px-3 md:px-4 py-3 border-t border-border bg-card/50">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="flex gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 rounded-xl h-11 md:h-12"
              disabled={isTyping}
            />
            <Button
              type="submit"
              size="icon"
              className="h-11 w-11 md:h-12 md:w-12 rounded-xl"
              disabled={!input.trim() || isTyping}
            >
              <Send className="w-5 h-5" />
            </Button>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
