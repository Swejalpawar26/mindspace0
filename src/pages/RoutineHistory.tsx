import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2, Calendar, CheckCircle2, XCircle } from "lucide-react";
import { motion } from "framer-motion";

interface RoutineRecord {
  id: string;
  created_at: string;
  goals: string[];
  stress_level: string;
  tasks: { title: string; icon: string | null; is_completed: boolean; category: string }[];
}

export default function RoutineHistory() {
  const { user } = useAuth();
  const [records, setRecords] = useState<RoutineRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadHistory();
  }, [user]);

  const loadHistory = async () => {
    const { data: routines } = await supabase
      .from("daily_routines")
      .select("id, created_at, goals, stress_level")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false })
      .limit(30);

    if (routines) {
      const withTasks = await Promise.all(
        routines.map(async (r) => {
          const { data: tasks } = await supabase
            .from("routine_tasks")
            .select("title, icon, is_completed, category")
            .eq("routine_id", r.id)
            .order("sort_order", { ascending: true });
          return { ...r, tasks: tasks || [] };
        })
      );
      setRecords(withTasks);
    }
    setLoading(false);
  };

  return (
    <AppLayout>
      <div className="p-4 md:p-6 overflow-y-auto h-full">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-primary" /> Routine History
          </h1>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : records.length === 0 ? (
            <Card className="shadow-card border-0 rounded-2xl">
              <CardContent className="p-8 text-center">
                <Calendar className="w-10 h-10 text-primary mx-auto mb-3" />
                <h3 className="font-semibold text-foreground mb-1">No Routine History</h3>
                <p className="text-sm text-muted-foreground">Create a routine to start tracking your progress! 📋</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {records.map((record, i) => {
                const completed = record.tasks.filter((t) => t.is_completed).length;
                const total = record.tasks.length;
                const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

                return (
                  <motion.div key={record.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <Card className="shadow-card border-0 rounded-2xl">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm font-semibold">
                            {new Date(record.created_at).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
                          </CardTitle>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${percent >= 80 ? "bg-green-100 text-green-700" : percent >= 50 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>
                            {percent}%
                          </span>
                        </div>
                        <Progress value={percent} className="h-2 mt-2" />
                        <div className="flex gap-2 mt-1 flex-wrap">
                          {record.goals.map((g) => (
                            <span key={g} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{g}</span>
                          ))}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-1.5">
                          {record.tasks.map((task, j) => (
                            <div key={j} className="flex items-center gap-2 text-sm">
                              {task.is_completed ? (
                                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                              ) : (
                                <XCircle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                              )}
                              <span>{task.icon || "⭐"}</span>
                              <span className={task.is_completed ? "text-foreground" : "text-muted-foreground"}>{task.title}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </AppLayout>
  );
}
