import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import { EmotionBadge } from "@/components/EmotionBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, MessageCircle, TrendingUp, Heart } from "lucide-react";
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
        .limit(20),
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

  const stats = [
    { label: "Messages", value: totalMessages, icon: MessageCircle },
    { label: "Mood Checks", value: moodEntries.length, icon: BarChart3 },
    { label: "Top Mood", value: topMood ? topMood[0] : "—", icon: TrendingUp },
    { label: "Streak", value: "1 day", icon: Heart },
  ];

  return (
    <AppLayout>
      <div className="p-6 overflow-y-auto h-full">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-foreground mb-6">Dashboard</h1>

          {loading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {stats.map((s, i) => (
                  <motion.div
                    key={s.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Card className="shadow-card border-0 rounded-2xl">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                            <s.icon className="w-5 h-5 text-accent-foreground" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">{s.label}</p>
                            <p className="text-lg font-bold text-foreground capitalize">{s.value}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Mood History */}
              <Card className="shadow-card border-0 rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-lg">Recent Moods</CardTitle>
                </CardHeader>
                <CardContent>
                  {moodEntries.length === 0 ? (
                    <p className="text-muted-foreground text-sm">Start chatting to track your moods! 🌟</p>
                  ) : (
                    <div className="space-y-3">
                      {moodEntries.slice(0, 10).map((entry) => (
                        <div key={entry.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                          <div className="flex items-center gap-3">
                            <EmotionBadge emotion={entry.mood} intensity={entry.intensity} />
                            {entry.note && (
                              <span className="text-sm text-muted-foreground truncate max-w-[200px]">
                                {entry.note}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(entry.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </motion.div>
      </div>
    </AppLayout>
  );
}
