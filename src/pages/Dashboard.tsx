import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import { DailyQuote } from "@/components/DailyQuote";
import { WellnessWidget } from "@/components/WellnessWidget";
import { MoodChart } from "@/components/MoodChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, Clock, Sparkles, Loader2, CheckCircle2, ListTodo, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

interface ChatPreview {
  content: string;
  created_at: string;
  role: string;
}

interface RoutineTask {
  id: string;
  time_slot: string;
  title: string;
  category: string;
  icon: string | null;
  is_completed: boolean;
}

interface MoodEntry {
  id: string;
  mood: string;
  intensity: string;
  note: string | null;
  created_at: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recentChats, setRecentChats] = useState<ChatPreview[]>([]);
  const [routineTasks, setRoutineTasks] = useState<RoutineTask[]>([]);
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  const loadData = async () => {
    const [chatRes, routineRes, moodRes] = await Promise.all([
      supabase
        .from("chat_messages")
        .select("content, created_at, role")
        .eq("user_id", user!.id)
        .eq("role", "user")
        .order("created_at", { ascending: false })
        .limit(5),
      // Get active routine tasks
      supabase
        .from("daily_routines")
        .select("id")
        .eq("user_id", user!.id)
        .eq("is_active", true)
        .limit(1)
        .maybeSingle(),
      supabase
        .from("mood_entries")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(100),
    ]);

    setRecentChats((chatRes.data as ChatPreview[]) || []);
    setMoodEntries((moodRes.data as MoodEntry[]) || []);

    if (routineRes.data) {
      const { data: tasks } = await supabase
        .from("routine_tasks")
        .select("id, time_slot, title, category, icon, is_completed")
        .eq("routine_id", routineRes.data.id)
        .order("sort_order", { ascending: true });
      setRoutineTasks((tasks as RoutineTask[]) || []);
    }

    setLoading(false);
    generateAiSuggestions(moodRes.data || []);
  };

  const generateAiSuggestions = async (moods: MoodEntry[]) => {
    setLoadingSuggestions(true);
    const suggestions: string[] = [];

    const recentMoods = moods.slice(0, 10);
    const sadCount = recentMoods.filter((m) => m.mood === "sad").length;
    const anxiousCount = recentMoods.filter((m) => m.mood === "anxious").length;
    const angryCount = recentMoods.filter((m) => m.mood === "angry").length;
    const happyCount = recentMoods.filter((m) => m.mood === "happy").length;

    if (sadCount >= 3) {
      suggestions.push("🌿 You've been feeling low lately. Try a 10-minute walk in nature or call a friend you trust.");
      suggestions.push("📖 Writing your thoughts in the Journal can help process emotions. Give it a try!");
      suggestions.push("🎵 Listening to uplifting music or a podcast can shift your mood. Here's a nudge to try it today!");
    } else if (anxiousCount >= 3) {
      suggestions.push("🌬️ You've been anxious recently. Try the box breathing exercise in the Wellness section.");
      suggestions.push("🧘 A 5-minute meditation break could help. Consider adding it to your AI Routine.");
      suggestions.push("📝 Grounding exercise: Name 5 things you see, 4 you hear, 3 you touch, 2 you smell, 1 you taste.");
    } else if (angryCount >= 2) {
      suggestions.push("💪 Channel that energy! A workout or run can help release frustration.");
      suggestions.push("✍️ Try writing down what's bothering you in the Journal — it can be surprisingly relieving.");
    } else if (happyCount >= 3) {
      suggestions.push("🌟 You're on a great streak! Keep up the positive habits that got you here.");
      suggestions.push("🎯 Great time to set new goals in AI Routine while your energy is high!");
    } else if (moods.length === 0) {
      suggestions.push("💬 Start chatting with MindSpace to get personalized wellness suggestions!");
      suggestions.push("📋 Set up your AI Daily Routine for a structured, balanced day.");
    } else {
      suggestions.push("🌱 Keep checking in with yourself daily — consistency is key to mental wellness.");
      suggestions.push("✨ Visit the Inspiration Hub for stories that might resonate with you today.");
    }

    setAiSuggestions(suggestions);
    setLoadingSuggestions(false);
  };

  const completedTasks = routineTasks.filter((t) => t.is_completed).length;
  const completionPercent = routineTasks.length > 0 ? Math.round((completedTasks / routineTasks.length) * 100) : 0;

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };
  const item = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <AppLayout>
      <div className="p-4 md:p-6 overflow-y-auto h-full">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <motion.div variants={container} initial="hidden" animate="show" className="max-w-5xl mx-auto space-y-6">
            {/* Daily Quote */}
            <motion.div variants={item}>
              <DailyQuote />
            </motion.div>

            {/* Stats Grid - only Recent Chats and Streak */}
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              <motion.div variants={item}>
                <Card
                  className="shadow-card border-0 rounded-2xl hover:shadow-soft transition-shadow duration-300 cursor-pointer"
                  onClick={() => navigate("/chat")}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center flex-shrink-0">
                        <MessageCircle className="w-5 h-5 text-accent-foreground" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">Recent Chats</p>
                        <p className="text-lg font-bold text-foreground">{recentChats.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div variants={item}>
                <Card className="shadow-card border-0 rounded-2xl hover:shadow-soft transition-shadow duration-300">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center flex-shrink-0">
                        <Clock className="w-5 h-5 text-accent-foreground" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">Routine Progress</p>
                        <p className="text-lg font-bold text-foreground">{completionPercent}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Current Routine Tasks */}
            {routineTasks.length > 0 && (
              <motion.div variants={item}>
                <Card className="shadow-card border-0 rounded-2xl">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <ListTodo className="w-5 h-5 text-primary" /> Today's Routine
                      </CardTitle>
                      <Button variant="ghost" size="sm" onClick={() => navigate("/ai-routine")} className="text-xs">
                        View All <ChevronRight className="w-3 h-3 ml-1" />
                      </Button>
                    </div>
                    <Progress value={completionPercent} className="h-2 mt-2" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {routineTasks.filter((t) => !t.is_completed).slice(0, 5).map((task) => (
                        <div key={task.id} className="flex items-center gap-3 p-2 rounded-xl bg-muted/30">
                          <span className="text-xs font-mono text-muted-foreground w-12">{task.time_slot}</span>
                          <span className="text-base">{task.icon || "⭐"}</span>
                          <span className="text-sm font-medium text-foreground flex-1">{task.title}</span>
                        </div>
                      ))}
                      {routineTasks.filter((t) => !t.is_completed).length === 0 && (
                        <div className="flex items-center gap-2 text-sm text-primary font-medium py-2">
                          <CheckCircle2 className="w-4 h-4" /> All tasks completed! 🎉
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* AI Suggestions */}
            <motion.div variants={item}>
              <Card className="shadow-card border-0 rounded-2xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" /> AI Suggestions for You
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingSuggestions ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {aiSuggestions.map((s, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="p-3 rounded-xl bg-accent/30 text-sm text-foreground"
                        >
                          {s}
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Charts + Wellness */}
            <div className="grid md:grid-cols-3 gap-4 md:gap-6">
              <motion.div variants={item} className="md:col-span-2">
                <MoodChart entries={moodEntries} />
              </motion.div>
              <motion.div variants={item}>
                <WellnessWidget />
              </motion.div>
            </div>

            {/* Recent Chats */}
            <motion.div variants={item}>
              <Card className="shadow-card border-0 rounded-2xl">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MessageCircle className="w-5 h-5 text-primary" /> Recent Chats
                    </CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => navigate("/chat")} className="text-xs">
                      View All <ChevronRight className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {recentChats.length === 0 ? (
                    <p className="text-muted-foreground text-sm">Start chatting to see your conversations here! 💬</p>
                  ) : (
                    <div className="space-y-2">
                      {recentChats.map((chat, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-accent/30 cursor-pointer transition-colors border-b border-border last:border-0"
                          onClick={() => navigate("/chat")}
                        >
                          <p className="text-sm text-foreground truncate max-w-[250px] md:max-w-[400px]">{chat.content}</p>
                          <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                            {new Date(chat.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
}
