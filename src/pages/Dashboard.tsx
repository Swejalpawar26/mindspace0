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
  const [routineTasks, setRoutineTasks] = useState<RoutineTask[]>([]);
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatCount, setChatCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  const loadData = async () => {
    const [chatCountRes, routineRes, moodRes] = await Promise.all([
      supabase.from("chat_messages").select("session_id", { count: "exact", head: true }).eq("user_id", user!.id).eq("role", "user"),
      supabase.from("daily_routines").select("id").eq("user_id", user!.id).eq("is_active", true).limit(1).maybeSingle(),
      supabase.from("mood_entries").select("*").eq("user_id", user!.id).order("created_at", { ascending: false }).limit(100),
    ]);

    setChatCount(chatCountRes.count || 0);
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
    generateSmartSuggestions(moodRes.data || []);
  };

  const generateSmartSuggestions = async (moods: MoodEntry[]) => {
    const suggestions: string[] = [];
    const recentMoods = moods.slice(0, 15);
    const sadCount = recentMoods.filter((m) => m.mood === "sad").length;
    const anxiousCount = recentMoods.filter((m) => m.mood === "anxious").length;
    const angryCount = recentMoods.filter((m) => m.mood === "angry").length;
    const happyCount = recentMoods.filter((m) => m.mood === "happy").length;

    // Based on mood patterns from chats
    if (sadCount >= 3) {
      suggestions.push("🌿 You've been feeling low recently. Try a 10-minute nature walk or call someone you trust.");
      suggestions.push("📝 Journaling can help process emotions — write what's on your mind today.");
      suggestions.push("🎵 Try listening to uplifting music. Small shifts in environment can help your mood.");
    } else if (anxiousCount >= 3) {
      suggestions.push("🌬️ Anxiety has been frequent. Try the box breathing technique: 4s in, 4s hold, 4s out.");
      suggestions.push("🧘 Add a 5-minute meditation to your routine — it compounds over time.");
      suggestions.push("📝 Grounding exercise: Name 5 things you see, 4 hear, 3 touch, 2 smell, 1 taste.");
    } else if (angryCount >= 2) {
      suggestions.push("💪 Channel that energy — a quick workout can help release frustration.");
      suggestions.push("✍️ Writing about what's bothering you can be surprisingly relieving.");
    } else if (happyCount >= 3) {
      suggestions.push("🌟 You're on a positive streak! Keep doing what you're doing.");
      suggestions.push("🎯 Great energy to set new goals in your AI Routine!");
    } else if (moods.length === 0) {
      suggestions.push("💬 Start chatting with MindSpace to get personalized wellness suggestions!");
      suggestions.push("📋 Set up your AI Daily Routine for a structured, balanced day.");
    } else {
      suggestions.push("🌱 Keep checking in daily — consistency is key to mental wellness.");
      suggestions.push("✨ Visit Inspiration Hub for stories that might resonate with you.");
    }

    // Routine-based suggestions
    const { data: incompleteTasks } = await supabase
      .from("routine_tasks")
      .select("category, title")
      .eq("user_id", user!.id)
      .eq("is_completed", false)
      .order("created_at", { ascending: false })
      .limit(30);

    if (incompleteTasks) {
      const skippedExercise = incompleteTasks.filter((t) => t.category === "exercise").length;
      const skippedMeditation = incompleteTasks.filter((t) => t.category === "meditation").length;
      if (skippedExercise >= 3) suggestions.push("💪 You've been skipping exercise. Even a 10-min walk counts — start small!");
      if (skippedMeditation >= 2) suggestions.push("🧘 Meditation has been missed — try a 3-minute breathing session today.");
    }

    setAiSuggestions(suggestions);
  };

  const completedTasks = routineTasks.filter((t) => t.is_completed).length;
  const completionPercent = routineTasks.length > 0 ? Math.round((completedTasks / routineTasks.length) * 100) : 0;

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

  return (
    <AppLayout>
      <div className="p-4 md:p-6 overflow-y-auto h-full">
        {loading ? (
          <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : (
          <motion.div variants={container} initial="hidden" animate="show" className="max-w-5xl mx-auto space-y-6">
            <motion.div variants={item}><DailyQuote /></motion.div>

            <div className="grid grid-cols-2 gap-3 md:gap-4">
              <motion.div variants={item}>
                <Card className="shadow-card border-0 rounded-2xl hover:shadow-soft transition-shadow duration-300 cursor-pointer" onClick={() => navigate("/chat-history")}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center flex-shrink-0">
                        <MessageCircle className="w-5 h-5 text-accent-foreground" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">Total Messages</p>
                        <p className="text-lg font-bold text-foreground">{chatCount}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div variants={item}>
                <Card className="shadow-card border-0 rounded-2xl hover:shadow-soft transition-shadow duration-300 cursor-pointer" onClick={() => navigate("/ai-routine")}>
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

            {routineTasks.length > 0 && (
              <motion.div variants={item}>
                <Card className="shadow-card border-0 rounded-2xl">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2"><ListTodo className="w-5 h-5 text-primary" /> Today's Routine</CardTitle>
                      <Button variant="ghost" size="sm" onClick={() => navigate("/ai-routine")} className="text-xs">View All <ChevronRight className="w-3 h-3 ml-1" /></Button>
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

            <motion.div variants={item}>
              <Card className="shadow-card border-0 rounded-2xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2"><Sparkles className="w-5 h-5 text-primary" /> AI Suggestions for You</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {aiSuggestions.map((s, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                        className="p-3 rounded-xl bg-accent/30 text-sm text-foreground">{s}</motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-4 md:gap-6">
              <motion.div variants={item} className="md:col-span-2"><MoodChart entries={moodEntries} /></motion.div>
              <motion.div variants={item}><WellnessWidget /></motion.div>
            </div>
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
}
