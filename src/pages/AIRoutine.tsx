import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Sparkles, RefreshCw, Save, CheckCircle2, Wand2, Plus, Pencil, Trash2, History } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { parseRoutineAIResponse } from "@/lib/routine";

const GOAL_OPTIONS = ["Study", "Fitness", "Meditation", "Work", "Creative", "Social"];
const INTEREST_OPTIONS = ["Coding", "Reading", "Gym", "Spirituality", "Art", "Music", "Gaming", "Cooking"];

interface RoutineTask {
  id?: string;
  time_slot: string;
  title: string;
  category: string;
  icon: string;
  is_completed: boolean;
  sort_order: number;
}

interface StoredRoutine {
  id: string;
  created_at: string;
  wake_up_time: string;
  sleep_time: string;
  goals: string[];
  stress_level: string;
  free_time: string | null;
  interests: string[];
  routine_data: Json | null;
  is_active: boolean;
}

const getDateKey = (value: string | Date) => {
  const date = new Date(value);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

const getDayAnchor = (value: string | Date) => {
  const date = new Date(value);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0, 0);
};

const addDays = (value: string | Date, amount: number) => {
  const date = getDayAnchor(value);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount, 12, 0, 0, 0);
};

const daysBetween = (from: string | Date, to: string | Date) => {
  const start = getDayAnchor(from);
  const end = getDayAnchor(to);
  return Math.max(0, Math.round((end.getTime() - start.getTime()) / 86400000));
};

const normalizeTasks = (items: RoutineTask[]) =>
  [...items]
    .sort((a, b) => a.time_slot.localeCompare(b.time_slot))
    .map((task, index) => ({ ...task, sort_order: index }));

const mapTaskRows = (taskRows: any[] = []): RoutineTask[] =>
  normalizeTasks(
    taskRows.map((task) => ({
      id: task.id,
      time_slot: task.time_slot,
      title: task.title,
      category: task.category,
      icon: task.icon || "⭐",
      is_completed: Boolean(task.is_completed),
      sort_order: task.sort_order ?? 0,
    }))
  );

export default function AIRoutine() {
  const { user } = useAuth();
  const navigate = useNavigate();
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
  const [activeRoutineDate, setActiveRoutineDate] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskTime, setNewTaskTime] = useState("09:00");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskCategory, setNewTaskCategory] = useState("routine");
  const [showConfig, setShowConfig] = useState(false);

  useEffect(() => {
    if (user) loadActiveRoutine();
  }, [user]);

  const applyRoutinePreferences = (routine: StoredRoutine) => {
    setWakeUp(routine.wake_up_time);
    setSleepTime(routine.sleep_time);
    setGoals(routine.goals || []);
    setStressLevel(routine.stress_level);
    setFreeTime(routine.free_time ?? "4");
    setInterests(routine.interests || []);
  };

  const setRoutineState = (routine: StoredRoutine, nextTasks: RoutineTask[]) => {
    applyRoutinePreferences(routine);
    setActiveRoutineId(routine.id);
    setActiveRoutineDate(getDateKey(routine.created_at));
    setTasks(nextTasks);
    setShowConfig(nextTasks.length === 0);
  };

  const loadTasksForRoutine = async (routineId: string) => {
    const { data, error } = await supabase
      .from("routine_tasks")
      .select("*")
      .eq("routine_id", routineId)
      .order("sort_order", { ascending: true });

    if (error) throw error;
    return data || [];
  };

  const createRoutineFromTemplate = async (
    templateRoutine: StoredRoutine,
    templateTasks: RoutineTask[],
    date: Date,
    isActive: boolean
  ) => {
    const timestamp = getDayAnchor(date).toISOString();
    const preparedTasks = normalizeTasks(
      templateTasks.map((task) => ({
        time_slot: task.time_slot,
        title: task.title,
        category: task.category,
        icon: task.icon,
        is_completed: false,
        sort_order: 0,
      }))
    );

    const { data: routine, error } = await supabase
      .from("daily_routines")
      .insert([{
        user_id: user!.id,
        wake_up_time: templateRoutine.wake_up_time,
        sleep_time: templateRoutine.sleep_time,
        goals: templateRoutine.goals || [],
        stress_level: templateRoutine.stress_level,
        free_time: templateRoutine.free_time,
        interests: templateRoutine.interests || [],
        routine_data: templateRoutine.routine_data ?? null,
        is_active: isActive,
        created_at: timestamp,
        updated_at: timestamp,
      }])
      .select()
      .single();

    if (error) throw error;

    if (!preparedTasks.length) {
      return { routine: routine as StoredRoutine, tasks: preparedTasks };
    }

    const taskInserts = preparedTasks.map((task, index) => ({
      routine_id: routine.id,
      user_id: user!.id,
      time_slot: task.time_slot,
      title: task.title,
      category: task.category,
      icon: task.icon,
      is_completed: false,
      sort_order: index,
      created_at: timestamp,
    }));

    const { data: insertedTasks, error: tasksError } = await supabase
      .from("routine_tasks")
      .insert(taskInserts)
      .select();

    if (tasksError) throw tasksError;

    return {
      routine: routine as StoredRoutine,
      tasks: mapTaskRows(insertedTasks || taskInserts),
    };
  };

  const loadActiveRoutine = async () => {
    setLoading(true);

    try {
      const { data: routines, error } = await supabase
        .from("daily_routines")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(120);

      if (error) throw error;

      const latestRoutine = routines?.[0] as StoredRoutine | undefined;

      if (!latestRoutine) {
        setActiveRoutineId(null);
        setActiveRoutineDate(null);
        setTasks([]);
        setSuggestion(null);
        setShowConfig(true);
        return;
      }

      applyRoutinePreferences(latestRoutine);

      const todayKey = getDateKey(new Date());
      const latestKey = getDateKey(latestRoutine.created_at);
      let nextSuggestion: string | null = null;

      if (latestKey === todayKey) {
        const { error: clearOldActivesError } = await supabase
          .from("daily_routines")
          .update({ is_active: false })
          .eq("user_id", user!.id)
          .eq("is_active", true)
          .neq("id", latestRoutine.id);

        if (clearOldActivesError) throw clearOldActivesError;

        if (!latestRoutine.is_active) {
          const { error: activateError } = await supabase
            .from("daily_routines")
            .update({ is_active: true })
            .eq("id", latestRoutine.id);

          if (activateError) throw activateError;
        }

        const latestTasks = mapTaskRows(await loadTasksForRoutine(latestRoutine.id));
        setRoutineState({ ...latestRoutine, is_active: true }, latestTasks);
      }
      else {
        const templateTasks = mapTaskRows(await loadTasksForRoutine(latestRoutine.id));

        if (!templateTasks.length) {
          setActiveRoutineId(null);
          setActiveRoutineDate(null);
          setTasks([]);
          setShowConfig(true);
          nextSuggestion = "Save one routine once and your fresh checklist will reset automatically every day.";
        } else {
          const { error: deactivateError } = await supabase
            .from("daily_routines")
            .update({ is_active: false })
            .eq("user_id", user!.id)
            .eq("is_active", true);

          if (deactivateError) throw deactivateError;

          const missedDays = Math.max(0, daysBetween(latestRoutine.created_at, new Date()) - 1);

          for (let dayOffset = 1; dayOffset <= missedDays; dayOffset += 1) {
            await createRoutineFromTemplate(latestRoutine, templateTasks, addDays(latestRoutine.created_at, dayOffset), false);
          }

          const { routine: todayRoutine, tasks: todayTasks } = await createRoutineFromTemplate(
            latestRoutine,
            templateTasks,
            new Date(),
            true
          );

          setRoutineState(todayRoutine, todayTasks);
          nextSuggestion = missedDays > 0
            ? `✨ Fresh routine ready. ${missedDays} skipped day${missedDays > 1 ? "s were" : " was"} saved as incomplete in history.`
            : "✨ Fresh routine ready for today.";
        }
      }

      if (!nextSuggestion) {
        const { data: incomplete } = await supabase
          .from("routine_tasks")
          .select("category")
          .eq("user_id", user!.id)
          .eq("is_completed", false)
          .order("created_at", { ascending: false })
          .limit(20);

        if (incomplete && incomplete.length > 0) {
          const skippedExercise = incomplete.filter((task: any) => task.category === "exercise").length;
          const skippedMeditation = incomplete.filter((task: any) => task.category === "meditation").length;

          if (skippedExercise >= 3) nextSuggestion = "💪 You've been skipping exercise — try a quick 10-min walk today!";
          else if (skippedMeditation >= 2) nextSuggestion = "🧘 Meditation has been missed lately — even 5 minutes can help!";
        }
      }

      setSuggestion(nextSuggestion);
    } catch {
      toast.error("Failed to load routine");
      setShowConfig(true);
      setSuggestion(null);
    } finally {
      setLoading(false);
    }
  };

  const toggleGoal = (g: string) => setGoals((prev) => prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]);
  const toggleInterest = (i: string) => setInterests((prev) => prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]);

  const generateRoutine = async () => {
    if (!goals.length) { toast.error("Pick at least one goal"); return; }
    setGenerating(true);
    setSuggestion(null);

    try {
      const prompt = `Create a detailed daily routine. Wake: ${wakeUp}, Sleep: ${sleepTime}. Goals: ${goals.join(", ")}. Stress: ${stressLevel}. Free time: ~${freeTime}h. Interests: ${interests.join(", ") || "general"}.
${stressLevel === "high" ? "Add extra relaxation and breathing exercises." : ""}
${goals.includes("Study") ? "Prioritize study blocks with Pomodoro breaks." : ""}
Return ONLY a JSON array: [{"time_slot":"HH:MM","title":"...","category":"study|exercise|meditation|break|meal|work|creative|social|relaxation|wake|morning|sleep|routine|free","icon":"emoji"}]`;

      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mental-health-chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({ messages: [{ role: "system", content: "Return ONLY valid JSON array. No markdown." }, { role: "user", content: prompt }] }),
      });

      const data = await resp.json();
      const parsed = parseRoutineAIResponse(data.reply || "");
      setTasks(normalizeTasks(parsed.map((t, i) => ({
        ...t,
        is_completed: false,
        sort_order: i,
      }))));
      setShowConfig(false);
      toast.success("✨ Routine generated!");
    } catch {
      toast.error("Failed to generate routine. Try again!");
    } finally {
      setGenerating(false);
    }
  };

  const saveRoutine = async () => {
    if (!tasks.length) return;
    setSaving(true);

    try {
      const normalized = normalizeTasks(tasks);
      const todayKey = getDateKey(new Date());
      const routineDetails = {
        wake_up_time: wakeUp,
        sleep_time: sleepTime,
        goals,
        stress_level: stressLevel,
        free_time: freeTime,
        interests,
        is_active: true,
        updated_at: new Date().toISOString(),
      };

      let routineId = activeRoutineId;
      let routineCreatedAt = new Date().toISOString();

      if (routineId && activeRoutineDate === todayKey) {
        const { data: updatedRoutine, error: updateRoutineError } = await supabase
          .from("daily_routines")
          .update(routineDetails)
          .eq("id", routineId)
          .select()
          .single();

        if (updateRoutineError) throw updateRoutineError;

        routineCreatedAt = updatedRoutine.created_at;

        const { error: deleteTasksError } = await supabase
          .from("routine_tasks")
          .delete()
          .eq("routine_id", routineId);

        if (deleteTasksError) throw deleteTasksError;
      } else {
        const { error: deactivateExistingError } = await supabase
          .from("daily_routines")
          .update({ is_active: false })
          .eq("user_id", user!.id)
          .eq("is_active", true);

        if (deactivateExistingError) throw deactivateExistingError;

        const { data: routine, error } = await supabase
          .from("daily_routines")
          .insert([{
            user_id: user!.id,
            ...routineDetails,
            created_at: new Date().toISOString(),
          }])
          .select()
          .single();

        if (error) throw error;
        routineId = routine.id;
        routineCreatedAt = routine.created_at;
      }

      if (!routineId) throw new Error("Routine could not be saved");

      const taskInserts = normalized.map((task, index) => ({
        routine_id: routineId,
        user_id: user!.id,
        time_slot: task.time_slot,
        title: task.title,
        category: task.category,
        icon: task.icon,
        is_completed: task.is_completed,
        sort_order: index,
      }));

      const { data: savedTasks, error: saveTasksError } = await supabase
        .from("routine_tasks")
        .insert(taskInserts)
        .select();

      if (saveTasksError) throw saveTasksError;

      setActiveRoutineId(routineId);
      setActiveRoutineDate(getDateKey(routineCreatedAt));
      setTasks(mapTaskRows(savedTasks || taskInserts));
      setShowConfig(false);
      setEditMode(false);
      setShowAddTask(false);
      toast.success(activeRoutineId && activeRoutineDate === todayKey ? "Routine updated! ✨" : "Routine saved! ✨");
    } catch {
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

  const addCustomTask = () => {
    if (!newTaskTitle.trim()) return;
    const newTask: RoutineTask = {
      time_slot: newTaskTime, title: newTaskTitle.trim(), category: newTaskCategory,
      icon: "⭐", is_completed: false, sort_order: tasks.length,
    };
    setTasks(normalizeTasks([...tasks, newTask]));
    setNewTaskTitle("");
    setShowAddTask(false);
    toast.success("Task added!");
  };

  const removeTask = (index: number) => {
    setTasks((prev) => normalizeTasks(prev.filter((_, i) => i !== index)));
  };

  const updateTaskTitle = (index: number, title: string) => {
    const updated = [...tasks];
    updated[index].title = title;
    setTasks(updated);
  };

  const completionPercent = tasks.length > 0 ? Math.round((tasks.filter((t) => t.is_completed).length / tasks.length) * 100) : 0;

  if (loading) {
    return <AppLayout><div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div></AppLayout>;
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6 overflow-y-auto h-full">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
              <Wand2 className="w-7 h-7 text-primary" /> AI Daily Routine
            </h1>
            <p className="text-muted-foreground text-sm mt-1">Your personalized day planner. Keep the same plan until you choose to refresh it.</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate("/routine-history")} className="rounded-xl gap-1.5 text-xs">
            <History className="w-4 h-4" /> History
          </Button>
        </motion.div>

        <AnimatePresence>
          {suggestion && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="bg-accent/50 border border-accent text-accent-foreground p-3 rounded-xl text-sm font-medium">
              {suggestion}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Config Form - shown initially or when editing */}
        <AnimatePresence>
          {(showConfig || (tasks.length === 0)) && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Card className="fairy-card">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2"><Sparkles className="w-5 h-5 text-primary" /> Configure Your Day</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>Wake-up Time</Label><Input type="time" value={wakeUp} onChange={(e) => setWakeUp(e.target.value)} className="mt-1" /></div>
                    <div><Label>Sleep Time</Label><Input type="time" value={sleepTime} onChange={(e) => setSleepTime(e.target.value)} className="mt-1" /></div>
                  </div>
                  <div><Label>Stress Level</Label>
                    <Select value={stressLevel} onValueChange={setStressLevel}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">🟢 Low</SelectItem>
                        <SelectItem value="medium">🟡 Medium</SelectItem>
                        <SelectItem value="high">🔴 High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label>Free Time (hours)</Label><Input type="number" min="0" max="16" value={freeTime} onChange={(e) => setFreeTime(e.target.value)} className="mt-1" /></div>
                  <div><Label className="mb-2 block">Goals</Label>
                    <div className="flex flex-wrap gap-2">
                      {GOAL_OPTIONS.map((g) => (
                        <button key={g} onClick={() => toggleGoal(g)} className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${goals.includes(g) ? "bg-primary text-primary-foreground shadow-soft" : "bg-muted text-muted-foreground hover:bg-accent"}`}>{g}</button>
                      ))}
                    </div>
                  </div>
                  <div><Label className="mb-2 block">Interests</Label>
                    <div className="flex flex-wrap gap-2">
                      {INTEREST_OPTIONS.map((i) => (
                        <button key={i} onClick={() => toggleInterest(i)} className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${interests.includes(i) ? "bg-secondary text-secondary-foreground shadow-soft" : "bg-muted text-muted-foreground hover:bg-accent"}`}>{i}</button>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button onClick={generateRoutine} disabled={generating} className="flex-1 fairy-btn">
                      {generating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
                      {generating ? "Crafting..." : "Generate Routine"}
                    </Button>
                    {tasks.length > 0 && <Button variant="outline" onClick={() => setShowConfig(false)}>Cancel</Button>}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Timeline */}
        <AnimatePresence>
          {tasks.length > 0 && !showConfig && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              <Card className="fairy-card">
                <CardContent className="pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-foreground">Today's Progress</span>
                    <span className="text-sm font-bold text-primary">{completionPercent}%</span>
                  </div>
                  <Progress value={completionPercent} className="h-3" />
                  <div className="flex gap-2 flex-wrap">
                    <Button onClick={saveRoutine} disabled={saving} variant="outline" size="sm">
                      {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Save className="w-4 h-4 mr-1" />} Save
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setEditMode(!editMode)}>
                      <Pencil className="w-4 h-4 mr-1" /> {editMode ? "Done" : "Edit"}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setShowAddTask(!showAddTask)}>
                      <Plus className="w-4 h-4 mr-1" /> Add Task
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setShowConfig(true)}>
                      <RefreshCw className="w-4 h-4 mr-1" /> Refresh Routine
                    </Button>
                    {completionPercent === 100 && (
                      <Button size="sm" className="fairy-btn"><CheckCircle2 className="w-4 h-4 mr-1" /> All Done! 🎉</Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Add custom task */}
              <AnimatePresence>
                {showAddTask && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                    <Card className="shadow-card border-0 rounded-2xl">
                      <CardContent className="p-4 space-y-3">
                        <div className="grid grid-cols-3 gap-2">
                          <Input type="time" value={newTaskTime} onChange={(e) => setNewTaskTime(e.target.value)} />
                          <Input placeholder="Task name" value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} className="col-span-2" />
                        </div>
                        <div className="flex gap-2 justify-end">
                          <Button variant="ghost" size="sm" onClick={() => setShowAddTask(false)}>Cancel</Button>
                          <Button size="sm" onClick={addCustomTask} disabled={!newTaskTitle.trim()}>Add</Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Task Cards */}
              <div className="space-y-2">
                {tasks.map((task, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all hover:shadow-soft ${task.is_completed ? "bg-accent/30 border-accent" : "bg-card border-border hover:border-primary/30"}`}>
                    <Checkbox checked={task.is_completed} onCheckedChange={() => toggleTask(i)} />
                    <span className="text-xs font-mono text-muted-foreground w-12">{task.time_slot}</span>
                    <span className="text-lg">{task.icon}</span>
                    {editMode ? (
                      <Input value={task.title} onChange={(e) => updateTaskTitle(i, e.target.value)} className="flex-1 h-8 text-sm" />
                    ) : (
                      <span className={`flex-1 text-sm font-medium ${task.is_completed ? "line-through text-muted-foreground" : "text-foreground"}`}>{task.title}</span>
                    )}
                    <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{task.category}</span>
                    {editMode && (
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => removeTask(i)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
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
