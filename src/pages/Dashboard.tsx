import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import { EmotionBadge } from "@/components/EmotionBadge";
import { MoodChart } from "@/components/MoodChart";
import { DailyQuote } from "@/components/DailyQuote";
import { WellnessWidget } from "@/components/WellnessWidget";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, MessageCircle, TrendingUp, Heart, Loader2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface MoodEntry {
  id: string;
  mood: string;
  intensity: string;
  note: string | null;
  created_at: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [totalMessages, setTotalMessages] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  const loadData = async () => {
    const [moodRes, msgRes] = await Promise.all([
      supabase
        .from("mood_entries")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(100),
      supabase
        .from("chat_messages")
        .select("id", { count: "exact" })
        .eq("user_id", user!.id),
    ]);
    setMoodEntries((moodRes.data as MoodEntry[]) || []);
    setTotalMessages(msgRes.count || 0);
    setLoading(false);
  };

  const moodCounts = moodEntries.reduce((acc, e) => {
    acc[e.mood] = (acc[e.mood] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0];

  // Compute improvement insight
  const getInsight = () => {
    if (moodEntries.length < 3) return "Keep chatting to unlock mood insights! 🌟";
    const recent = moodEntries.slice(0, 5);
    const older = moodEntries.slice(5, 10);
    const positiveRecent = recent.filter((e) => e.mood === "happy").length;
    const positiveOlder = older.filter((e) => e.mood === "happy").length;
    if (positiveRecent > positiveOlder) return "You're trending more positive recently! Keep it up! 🎉";
    if (recent.some((e) => e.mood === "anxious")) return "You've been feeling anxious lately. Try some breathing exercises 🌬️";
    return "You're doing great by checking in with yourself! 💪";
  };

  const stats = [
    { label: "Messages", value: totalMessages, icon: MessageCircle },
    { label: "Mood Checks", value: moodEntries.length, icon: BarChart3 },
    { label: "Top Mood", value: topMood ? topMood[0] : "—", icon: TrendingUp },
    { label: "Streak", value: "1 day", icon: Heart },
  ];

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

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {stats.map((s) => (
                <motion.div key={s.label} variants={item}>
                  <Card className="shadow-card border-0 rounded-2xl hover:shadow-soft transition-shadow duration-300">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center flex-shrink-0">
                          <s.icon className="w-5 h-5 text-accent-foreground" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground">{s.label}</p>
                          <p className="text-lg font-bold text-foreground capitalize truncate">{s.value}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Insight */}
            <motion.div variants={item}>
              <Card className="shadow-card border-0 rounded-2xl bg-accent/30">
                <CardContent className="p-4 flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-primary flex-shrink-0" />
                  <p className="text-sm text-foreground">{getInsight()}</p>
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

            {/* Mood History */}
            <motion.div variants={item}>
              <Card className="shadow-card border-0 rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-lg">Recent Moods</CardTitle>
                </CardHeader>
                <CardContent>
                  {moodEntries.length === 0 ? (
                    <p className="text-muted-foreground text-sm">Start chatting to track your moods! 🌟</p>
                  ) : (
                    <div className="space-y-2">
                      {moodEntries.slice(0, 10).map((entry) => (
                        <div key={entry.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                          <div className="flex items-center gap-3 min-w-0">
                            <EmotionBadge emotion={entry.mood} intensity={entry.intensity} />
                            {entry.note && (
                              <span className="text-sm text-muted-foreground truncate max-w-[180px] md:max-w-[300px]">
                                {entry.note}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                            {new Date(entry.created_at).toLocaleDateString()}
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
