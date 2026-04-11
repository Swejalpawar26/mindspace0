import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Settings, Moon, Sun, Trash2, HelpCircle, Info, Shield, Download } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains("dark"));
  const [clearing, setClearing] = useState(false);

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const clearChatHistory = async () => {
    setClearing(true);
    try {
      await supabase.from("chat_messages").delete().eq("user_id", user!.id);
      toast.success("Chat history cleared! 🧹");
    } catch {
      toast.error("Failed to clear chat history");
    } finally {
      setClearing(false);
    }
  };

  const exportData = async () => {
    try {
      const [chats, journal, moods] = await Promise.all([
        supabase.from("chat_messages").select("*").eq("user_id", user!.id),
        supabase.from("journal_entries").select("*").eq("user_id", user!.id),
        supabase.from("mood_entries").select("*").eq("user_id", user!.id),
      ]);

      const data = {
        chats: chats.data || [],
        journal: journal.data || [],
        moods: moods.data || [],
        exported_at: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `mindspace-export-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Data exported! 📦");
    } catch {
      toast.error("Failed to export data");
    }
  };

  return (
    <AppLayout>
      <div className="p-4 md:p-6 overflow-y-auto h-full">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto space-y-4">
          <h1 className="text-2xl font-bold text-foreground mb-6">Settings</h1>

          {/* Appearance */}
          <Card className="shadow-card border-0 rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                {darkMode ? <Moon className="w-5 h-5 text-primary" /> : <Sun className="w-5 h-5 text-primary" />}
                Appearance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Dark Mode</Label>
                  <p className="text-xs text-muted-foreground">Switch between light and dark theme</p>
                </div>
                <Switch checked={darkMode} onCheckedChange={toggleDarkMode} />
              </div>
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card className="shadow-card border-0 rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary" />
                Data Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Export My Data</Label>
                  <p className="text-xs text-muted-foreground">Download all your chats, journal entries, and mood data</p>
                </div>
                <Button variant="outline" size="sm" onClick={exportData} className="rounded-xl gap-1.5">
                  <Download className="w-4 h-4" /> Export
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium text-destructive">Clear Chat History</Label>
                  <p className="text-xs text-muted-foreground">Permanently delete all chat messages</p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" className="rounded-xl gap-1.5" disabled={clearing}>
                      <Trash2 className="w-4 h-4" /> Clear
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Clear All Chat History?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete all your chat messages. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={clearChatHistory}>Yes, Clear All</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>

          {/* Help & Privacy */}
          <Card className="shadow-card border-0 rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-primary" />
                Help & Support
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 rounded-xl bg-accent/30">
                <h4 className="text-sm font-semibold text-foreground mb-1">How to use MindSpace</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>💬 <strong>Chat</strong> — Talk to your AI companion about anything on your mind</li>
                  <li>📊 <strong>Dashboard</strong> — View your mood trends, routine progress, and AI suggestions</li>
                  <li>📝 <strong>Journal</strong> — Write daily entries with AI mood analysis and prompts</li>
                  <li>📋 <strong>AI Routine</strong> — Generate and track personalized daily routines</li>
                  <li>✨ <strong>Inspiration</strong> — Read stories of people who overcame similar challenges</li>
                  <li>📞 <strong>Helpline</strong> — Access mental health helpline numbers</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* About */}
          <Card className="shadow-card border-0 rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Info className="w-5 h-5 text-primary" />
                About
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                <strong>MindSpace</strong> is an AI-powered mental wellness companion that helps you track your mood, build healthy routines, and find inspiration from real-life stories.
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Shield className="w-3.5 h-3.5" />
                <span>Your data is private and encrypted. We never share your information.</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Version 1.0.0</p>
            </CardContent>
          </Card>

          {/* Sign Out */}
          <Button variant="outline" className="w-full rounded-xl text-destructive border-destructive/30 hover:bg-destructive/10" onClick={signOut}>
            Sign Out
          </Button>
        </motion.div>
      </div>
    </AppLayout>
  );
}
