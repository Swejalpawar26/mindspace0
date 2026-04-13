import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, Loader2, ChevronRight, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface ChatSession {
  session_id: string;
  title: string;
  last_message_at: string;
  message_count: number;
}

export default function ChatHistory() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadSessions();
  }, [user]);

  const loadSessions = async () => {
    const { data } = await supabase
      .from("chat_messages")
      .select("session_id, content, created_at, role")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false });

    if (data) {
      const sessionMap = new Map<string, { messages: typeof data }>();
      data.forEach((m) => {
        const sid = m.session_id || "default";
        if (!sessionMap.has(sid)) sessionMap.set(sid, { messages: [] });
        sessionMap.get(sid)!.messages.push(m);
      });

      const sessionList: ChatSession[] = [];
      sessionMap.forEach((val, key) => {
        const userMsgs = val.messages.filter((m) => m.role === "user");
        const firstUserMsg = userMsgs[userMsgs.length - 1]?.content || "Chat session";
        const title = firstUserMsg.length > 60 ? firstUserMsg.slice(0, 60) + "..." : firstUserMsg;
        sessionList.push({
          session_id: key,
          title,
          last_message_at: val.messages[0]?.created_at || "",
          message_count: val.messages.length,
        });
      });

      sessionList.sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime());
      setSessions(sessionList);
    }
    setLoading(false);
  };

  const deleteSession = async (sessionId: string) => {
    const { error } = await supabase.from("chat_messages").delete().eq("session_id", sessionId).eq("user_id", user!.id);
    if (error) {
      toast.error("Failed to delete chat session");
      return;
    }
    setSessions((prev) => prev.filter((s) => s.session_id !== sessionId));
    toast.success("Chat session deleted");
  };

  return (
    <AppLayout>
      <div className="p-4 md:p-6 overflow-y-auto h-full">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-foreground">Chat History</h1>
            <Button onClick={() => navigate("/chat")} className="rounded-xl gap-2" size="sm">
              <MessageCircle className="w-4 h-4" /> New Chat
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : sessions.length === 0 ? (
            <Card className="shadow-card border-0 rounded-2xl">
              <CardContent className="p-8 text-center">
                <MessageCircle className="w-10 h-10 text-primary mx-auto mb-3" />
                <h3 className="font-semibold text-foreground mb-1">No Chats Yet</h3>
                <p className="text-sm text-muted-foreground">Start a conversation with MindSpace! 💬</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {sessions.map((session, i) => (
                <motion.div
                  key={session.session_id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="shadow-card border-0 rounded-2xl hover:shadow-soft transition-all cursor-pointer"
                    onClick={() => navigate(`/chat?session=${session.session_id}`)}>
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center flex-shrink-0">
                        <MessageCircle className="w-5 h-5 text-accent-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{session.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-muted-foreground">
                            {new Date(session.last_message_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </span>
                          <span className="text-xs text-muted-foreground">• {session.message_count} msgs</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive flex-shrink-0"
                        onClick={(e) => { e.stopPropagation(); deleteSession(session.session_id); }}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </AppLayout>
  );
}
