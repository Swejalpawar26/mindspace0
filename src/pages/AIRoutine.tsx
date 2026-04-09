import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Sparkles, RefreshCw, Save, CheckCircle2, Wand2 } from "lucide-react";
import { toast } from "sonner";

const GOAL_OPTIONS = ["Study", "Fitness", "Meditation", "Work", "Creative", "Social"];
const INTEREST_OPTIONS = ["Coding", "Reading", "Gym", "Spirituality", "Art", "Music", "Gaming", "Cooking"];

const CATEGORY_ICONS: Record<string, string> = {
  wake: "🌅", morning: "🌤️", study: "📚", exercise: "💪", meditation: "🧘",
  break: "☕", meal: "🍽️", work: "💻", creative: "🎨", social: "👥",
  relaxation: "🌿", sleep: "😴", routine: "⭐", free: "🎯",
};

interface RoutineTask {
  id?: string;
  time_slot: string;
  title: string;
  category: string;
  icon: string;
  is_completed: boolean;
  sort_order: number;
}

export default function AIRoutine() {
  const { user } = useAuth();
  const [wakeUp, setWakeUp] = useState("07:00");
  const [sleepTime, setSleepTime] = useState("23:00");
  const [goals, setGoals] = useState<string[]>([]);
  const [stressLevel, setStressLevel] = useState("medium");
  const [freeTime, setFreeTime] = useState("4");
  const [interests, setInterests] = useState<string[]>([]);
  const [tasks, setTasks] = useState<RoutineTask[]>([]);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeRoutineId, setActiveRoutineId] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadActiveRoutine();
  }, [user]);

  const loadActiveRoutine = async () => {
    const { data: routine } = await supabase
      .from("daily_routines")
      .select("*")
      .eq("user_id", user!.id)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (routine) {
      setActiveRoutineId(routine.id);
      setWakeUp(routine.wake_up_time);
      setSleepTime(routine.sleep_time);
      setGoals(routine.goals || []);
      setStressLevel(routine.stress_level);
      setFreeTime(routine.free_time || "4");
      setInterests(routine.interests || []);

      const { data: taskData } = await supabase
        .from("routine_tasks")
        .select("*")
        .eq("routine_id", routine.id)
        .order("sort_order", { ascending: true });

      if (taskData) {
        setTasks(taskData.map((t: any) => ({
          id: t.id,
          time_slot: t.time_slot,
          title: t.title,
          category: t.category,
          icon: t.icon || "⭐",
          is_completed: t.is_completed,
          sort_order: t.sort_order,
        })));
      }

      // Smart suggestion
      const { data: yesterday } = await supabase
        .from("routine_tasks")
        .select("*")
        .eq("user_id", user!.id)
        .eq("is_completed", false)
        .order("created_at", { ascending: false })
        .limit(20);

      if (yesterday && yesterday.length > 0) {
        const skipped = yesterday.find((t: any) => t.category === "exercise");
        if (skipped) setSuggestion("✨ You skipped exercise recently — adding extra movement today!");
      }
    }
    setLoading(false);
  };

  const toggleGoal = (g: string) => setGoals((prev) => prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]);
  const toggleInterest = (i: string) => setInterests((prev) => prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]);

  const generateRoutine = async () => {
    if (!goals.length) { toast.error("Pick at least one goal"); return; }
    setGenerating(true);
    setSuggestion(null);

    try {
      const prompt = `Create a detailed daily routine for someone who:
- Wakes at ${wakeUp}, sleeps at ${sleepTime}
- Goals: ${goals.join(", ")}
- Stress level: ${stressLevel}
- Free time: ~${freeTime} hours
- Interests: ${interests.join(", ") || "general"}

${stressLevel === "high" ? "IMPORTANT: Include extra relaxation, breathing exercises, and gentle activities." : ""}
${goals.includes("Study") ? "Prioritize study blocks with breaks using Pomodoro technique." : ""}

Return a JSON array of tasks. Each task: {"time_slot": "HH:MM", "title": "...", "category": "study|exercise|meditation|break|meal|work|creative|social|relaxation|wake|morning|sleep|routine|free", "icon": "emoji"}
Return ONLY the JSON array, no other text.`;

      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mental-health-chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [
            { role: "system", content: "You are a daily routine planner. Return ONLY a valid JSON array of tasks. No markdown, no code blocks." },
            { role: "user", content: prompt },
          ],
        }),
      });

      const data = await resp.json();
      const raw = data.reply || "";
      const jsonMatch = raw.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error("Invalid response");

      const parsed: any[] = JSON.parse(jsonMatch[0]);
      const newTasks: RoutineTask[] = parsed.map((t: any, i: number) => ({
        time_slot: t.time_slot || "08:00",
        title: t.title || "Activity",
        category: t.category || "routine",
        icon: t.icon || CATEGORY_ICONS[t.category] || "⭐",
        is_completed: false,
        sort_order: i,
      }));

      setTasks(newTasks);
      toast.success("✨ Routine generated!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to generate routine. Try again!");
    } finally {
      setGenerating(false);
    }
  };

  const saveRoutine = async () => {
    if (!tasks.length) return;
    setSaving(true);

    try {
      // Deactivate old routines
      if (activeRoutineId) {
        await supabase.from("daily_routines").update({ is_active: false }).eq("id", activeRoutineId);
      }

      const { data: routine, error } = await supabase.from("daily_routines").insert({
        user_id: user!.id,
        wake_up_time: wakeUp,
        sleep_time: sleepTime,
        goals,
        stress_level: stressLevel,
        free_time: freeTime,
        interests,
        is_active: true,
      }).select().single();

      if (error) throw error;

      const taskInserts = tasks.map((t, i) => ({
        routine_id: routine.id,
        user_id: user!.id,
        time_slot: t.time_slot,
        title: t.title,
        category: t.category,
        icon: t.icon,
        is_completed: t.is_completed,
        sort_order: i,
      }));

      await supabase.from("routine_tasks").insert(taskInserts);
      setActiveRoutineId(routine.id);
      toast.success("Routine saved! ✨");
    } catch (e) {
      toast.error("Failed to save routine");
    } finally {
      setSaving(false);
    }
  };

  const toggleTask = async (index: number) => {
    const updated = [...tasks];
    updated[index].is_completed = !updated[index].is_completed;
    setTasks(updated);

    if (updated[index].id) {
      await supabase.from("routine_tasks").update({ is_completed: updated[index].is_completed }).eq("id", updated[index].id);
    }
  };

  const completionPercent = tasks.length > 0 ? Math.round((tasks.filter((t) => t.is_completed).length / tasks.length) * 100) : 0;

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6 overflow-y-auto h-full">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center justify-center gap-2">
            <Wand2 className="w-7 h-7 text-primary" />
            AI Daily Routine
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Your personalized magical day planner ✨</p>
        </motion.div>

        {/* Smart Suggestion */}
        <AnimatePresence>
          {suggestion && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="bg-accent/50 border border-accent text-accent-foreground p-3 rounded-xl text-sm font-medium">
              {suggestion}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <Card className="fairy-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><Sparkles className="w-5 h-5 text-primary" /> Configure Your Day</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Wake-up Time</Label>
                <Input type="time" value={wakeUp} onChange={(e) => setWakeUp(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label>Sleep Time</Label>
                <Input type="time" value={sleepTime} onChange={(e) => setSleepTime(e.target.value)} className="mt-1" />
              </div>
            </div>

            <div>
              <Label>Stress Level</Label>
              <Select value={stressLevel} onValueChange={setStressLevel}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">🟢 Low</SelectItem>
                  <SelectItem value="medium">🟡 Medium</SelectItem>
                  <SelectItem value="high">🔴 High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Free Time (hours)</Label>
              <Input type="number" min="0" max="16" value={freeTime} onChange={(e) => setFreeTime(e.target.value)} className="mt-1" />
            </div>

            <div>
              <Label className="mb-2 block">Goals</Label>
              <div className="flex flex-wrap gap-2">
                {GOAL_OPTIONS.map((g) => (
                  <button key={g} onClick={() => toggleGoal(g)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${goals.includes(g) ? "bg-primary text-primary-foreground shadow-soft" : "bg-muted text-muted-foreground hover:bg-accent"}`}>
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="mb-2 block">Interests</Label>
              <div className="flex flex-wrap gap-2">
                {INTEREST_OPTIONS.map((i) => (
                  <button key={i} onClick={() => toggleInterest(i)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${interests.includes(i) ? "bg-secondary text-secondary-foreground shadow-soft" : "bg-muted text-muted-foreground hover:bg-accent"}`}>
                    {i}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button onClick={generateRoutine} disabled={generating} className="flex-1 fairy-btn">
                {generating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
                {generating ? "Crafting..." : "Generate Routine"}
              </Button>
              {tasks.length > 0 && (
                <Button variant="outline" onClick={generateRoutine} disabled={generating}>
                  <RefreshCw className="w-4 h-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <AnimatePresence>
          {tasks.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              {/* Progress & Actions */}
              <Card className="fairy-card">
                <CardContent className="pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-foreground">Today's Progress</span>
                    <span className="text-sm font-bold text-primary">{completionPercent}%</span>
                  </div>
                  <Progress value={completionPercent} className="h-3" />
                  <div className="flex gap-2">
                    <Button onClick={saveRoutine} disabled={saving} variant="outline" size="sm">
                      {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Save className="w-4 h-4 mr-1" />}
                      Save Routine
                    </Button>
                    {completionPercent === 100 && (
                      <Button size="sm" className="fairy-btn">
                        <CheckCircle2 className="w-4 h-4 mr-1" /> All Done! 🎉
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Task Cards */}
              <div className="space-y-2">
                {tasks.map((task, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all hover:shadow-soft cursor-pointer ${task.is_completed ? "bg-accent/30 border-accent" : "bg-card border-border hover:border-primary/30"}`}
                    onClick={() => toggleTask(i)}>
                    <Checkbox checked={task.is_completed} onCheckedChange={() => toggleTask(i)} />
                    <span className="text-xs font-mono text-muted-foreground w-12">{task.time_slot}</span>
                    <span className="text-lg">{task.icon}</span>
                    <span className={`flex-1 text-sm font-medium ${task.is_completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
                      {task.title}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{task.category}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
}
