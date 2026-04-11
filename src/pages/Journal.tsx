import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import { EmotionBadge } from "@/components/EmotionBadge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BookOpen, Plus, Loader2, Trash2, Sparkles, Search, SlidersHorizontal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const JOURNAL_PROMPTS = [
  "What made you smile today? 😊",
  "What's one thing you're grateful for right now?",
  "How are you really feeling — behind the surface?",
  "What challenge did you face today, and how did you handle it?",
  "What would you tell your younger self right now?",
  "Describe a moment today where you felt at peace.",
  "What's something you need to let go of?",
  "Write a letter to your future self.",
];

interface JournalEntry {
  id: string;
  title: string | null;
  content: string;
  mood: string | null;
  mood_feedback: string | null;
  created_at: string;
}

export default function Journal() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [moodFilter, setMoodFilter] = useState("all");
  const [currentPrompt, setCurrentPrompt] = useState(() => JOURNAL_PROMPTS[Math.floor(Math.random() * JOURNAL_PROMPTS.length)]);

  useEffect(() => {
    if (!user) return;
    loadEntries();
  }, [user]);

  const loadEntries = async () => {
    const { data } = await supabase
      .from("journal_entries")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false })
      .limit(50);
    setEntries((data as JournalEntry[]) || []);
    setLoading(false);
  };

  const analyzeAndSave = async () => {
    if (!content.trim()) return;
    setSaving(true);

    try {
      const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mental-health-chat`;
      let mood: string | null = null;
      let moodFeedback: string | null = null;

      try {
        const resp = await fetch(CHAT_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            messages: [{ role: "user", content: `Analyze this journal entry and respond with your assessment: "${content.slice(0, 500)}"` }],
          }),
        });
        if (resp.ok) {
          const data = await resp.json();
          mood = data.emotion;
          moodFeedback = data.reply;
        }
      } catch {}

      await supabase.from("journal_entries").insert({
        user_id: user!.id,
        title: title.trim() || null,
        content: content.trim(),
        mood,
        mood_feedback: moodFeedback,
      });

      if (mood && mood !== "neutral") {
        await supabase.from("mood_entries").insert({
          user_id: user!.id,
          mood,
          intensity: "medium",
          note: `Journal: ${(title || content).slice(0, 100)}`,
        });
      }

      toast.success("Journal entry saved! 📝");
      setTitle("");
      setContent("");
      setShowForm(false);
      loadEntries();
    } catch {
      toast.error("Failed to save entry");
    } finally {
      setSaving(false);
    }
  };

  const deleteEntry = async (id: string) => {
    await supabase.from("journal_entries").delete().eq("id", id);
    setEntries((prev) => prev.filter((e) => e.id !== id));
    toast.success("Entry deleted");
  };

  const usePrompt = () => {
    setContent(currentPrompt);
    setCurrentPrompt(JOURNAL_PROMPTS[Math.floor(Math.random() * JOURNAL_PROMPTS.length)]);
    if (!showForm) setShowForm(true);
  };

  const filteredEntries = entries.filter((e) => {
    const matchSearch = !searchQuery || e.content.toLowerCase().includes(searchQuery.toLowerCase()) || (e.title || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchMood = moodFilter === "all" || e.mood === moodFilter;
    return matchSearch && matchMood;
  });

  // Group entries by month
  const grouped = filteredEntries.reduce<Record<string, JournalEntry[]>>((acc, entry) => {
    const key = new Date(entry.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long" });
    if (!acc[key]) acc[key] = [];
    acc[key].push(entry);
    return acc;
  }, {});

  return (
    <AppLayout>
      <div className="p-4 md:p-6 overflow-y-auto h-full">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-foreground">Journal</h1>
            <Button onClick={() => setShowForm(!showForm)} className="rounded-xl gap-2" size="sm">
              <Plus className="w-4 h-4" /> New Entry
            </Button>
          </div>

          {/* Daily Prompt */}
          <Card className="shadow-card border-0 rounded-2xl mb-4 cursor-pointer hover:shadow-soft transition-shadow" onClick={usePrompt}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground">Today's Prompt</p>
                <p className="text-sm text-foreground">{currentPrompt}</p>
              </div>
            </CardContent>
          </Card>

          {/* New Entry Form */}
          <AnimatePresence>
            {showForm && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-4">
                <Card className="shadow-card border-0 rounded-2xl">
                  <CardContent className="p-5 space-y-4">
                    <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Entry title (optional)" className="rounded-xl h-11" />
                    <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write your thoughts here..." className="rounded-xl min-h-[150px] resize-none" />
                    <div className="flex gap-2 justify-end">
                      <Button variant="ghost" onClick={() => setShowForm(false)} className="rounded-xl">Cancel</Button>
                      <Button onClick={analyzeAndSave} disabled={!content.trim() || saving} className="rounded-xl gap-2">
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        Save & Analyze
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Search & Filter */}
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search entries..." className="pl-9 rounded-xl h-10" />
            </div>
            <Select value={moodFilter} onValueChange={setMoodFilter}>
              <SelectTrigger className="w-32 rounded-xl h-10">
                <SlidersHorizontal className="w-3.5 h-3.5 mr-1.5" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Moods</SelectItem>
                <SelectItem value="happy">Happy</SelectItem>
                <SelectItem value="sad">Sad</SelectItem>
                <SelectItem value="anxious">Anxious</SelectItem>
                <SelectItem value="angry">Angry</SelectItem>
                <SelectItem value="neutral">Neutral</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Entries List */}
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : filteredEntries.length === 0 ? (
            <Card className="shadow-card border-0 rounded-2xl">
              <CardContent className="p-8 text-center">
                <BookOpen className="w-10 h-10 text-primary mx-auto mb-3" />
                <h3 className="font-semibold text-foreground mb-1">{searchQuery ? "No matching entries" : "Start Journaling"}</h3>
                <p className="text-sm text-muted-foreground">
                  {searchQuery ? "Try a different search term" : "Write down your thoughts and feelings. We'll analyze the mood for you! 🌱"}
                </p>
              </CardContent>
            </Card>
          ) : (
            Object.entries(grouped).map(([month, monthEntries]) => (
              <div key={month} className="mb-6">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">{month}</h3>
                <div className="space-y-3">
                  {monthEntries.map((entry, i) => (
                    <motion.div key={entry.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                      <Card className="shadow-card border-0 rounded-2xl hover:shadow-soft transition-shadow duration-300">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className="text-xs text-muted-foreground">
                                  {new Date(entry.created_at).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                                </span>
                                {entry.mood && <EmotionBadge emotion={entry.mood} />}
                              </div>
                              {entry.title && <h3 className="font-semibold text-foreground mb-1">{entry.title}</h3>}
                              <p className="text-sm text-foreground/80 whitespace-pre-wrap line-clamp-4">{entry.content}</p>
                              {entry.mood_feedback && (
                                <div className="mt-3 bg-accent/40 rounded-xl p-3">
                                  <div className="flex items-center gap-1.5 mb-1">
                                    <Sparkles className="w-3 h-3 text-primary" />
                                    <span className="text-xs font-semibold text-foreground">AI Insight</span>
                                  </div>
                                  <p className="text-xs text-foreground/80">{entry.mood_feedback}</p>
                                </div>
                              )}
                            </div>
                            <Button variant="ghost" size="icon" className="flex-shrink-0 h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => deleteEntry(entry.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))
          )}
        </motion.div>
      </div>
    </AppLayout>
  );
}
