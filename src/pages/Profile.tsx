import { useState, useEffect, ChangeEvent } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Save, Loader2, Mail, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function Profile() {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [selectedFileName, setSelectedFileName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(true);
  const [stats, setStats] = useState({ chats: 0, journals: 0, routines: 0 });

  useEffect(() => {
    if (user) loadProfile();
  }, [user]);

  const loadProfile = async () => {
    const [{ data: profile }, { count: chats }, { count: journals }, { count: routines }] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", user!.id).maybeSingle(),
      supabase.from("chat_messages").select("*", { count: "exact", head: true }).eq("user_id", user!.id),
      supabase.from("journal_entries").select("*", { count: "exact", head: true }).eq("user_id", user!.id),
      supabase.from("daily_routines").select("*", { count: "exact", head: true }).eq("user_id", user!.id),
    ]);

    if (profile) {
      setDisplayName(profile.display_name || "");
      setAvatarUrl(profile.avatar_url || "");
    }
    setStats({ chats: chats || 0, journals: journals || 0, routines: routines || 0 });
    setLoading(false);
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      const { error: authError } = await supabase.auth.updateUser({ data: { display_name: displayName } });
      if (authError) throw authError;

      const { error } = await supabase
        .from("profiles")
        .update({ display_name: displayName, avatar_url: avatarUrl || null })
        .eq("user_id", user!.id);
      if (error) throw error;

      toast.success("Profile updated! ✨");
      setIsEditing(false);
    } catch {
      toast.error("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") {
        setAvatarUrl(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const initials = displayName
    ? displayName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() || "U";

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
      <div className="p-4 md:p-6 overflow-y-auto h-full">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto space-y-4">
          <h1 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
            <User className="w-6 h-6 text-primary" /> My Profile
          </h1>

          {/* Avatar & Info */}
          <Card className="shadow-card border-0 rounded-2xl">
            <CardContent className="pt-6 flex flex-col items-center gap-4">
              <Avatar className="w-20 h-20 border-4 border-primary/20">
                {avatarUrl ? (
                  <AvatarImage src={avatarUrl} />
                ) : (
                  <User className="w-10 h-10 text-primary" />
                )}
                <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">{initials}</AvatarFallback>
              </Avatar>
              <div className="text-center">
                <h2 className="text-lg font-semibold text-foreground">{displayName || "MindSpace User"}</h2>
                <p className="text-sm text-muted-foreground flex items-center gap-1 justify-center">
                  <Mail className="w-3.5 h-3.5" /> {user?.email}
                </p>
                <p className="text-xs text-muted-foreground flex items-center gap-1 justify-center mt-1">
                  <Calendar className="w-3.5 h-3.5" /> Joined {new Date(user?.created_at || "").toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Edit Profile */}
          <Card className="shadow-card border-0 rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Edit Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Display Name</Label>
                <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your name" className="mt-1" />
              </div>
              {isEditing && (
                <div>
                  <Label>Profile Picture</Label>
                  <Input type="file" accept="image/*" onChange={handleAvatarFileChange} className="mt-1" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    {selectedFileName ? `Selected: ${selectedFileName}` : "Choose an image from your computer to use as your profile picture."}
                  </p>
                </div>
              )}
              <Button
                type="button"
                onClick={isEditing ? saveProfile : () => setIsEditing(true)}
                disabled={saving}
                className="w-full fairy-btn"
              >
                {isEditing ? (
                  saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />
                ) : (
                  <User className="w-4 h-4 mr-2" />
                )}
                {isEditing ? "Save Changes" : "Edit Profile"}
              </Button>
            </CardContent>
          </Card>

          {/* Stats */}
          <Card className="shadow-card border-0 rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Activity Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 rounded-xl bg-accent/30">
                  <p className="text-2xl font-bold text-primary">{stats.chats}</p>
                  <p className="text-xs text-muted-foreground">Messages</p>
                </div>
                <div className="p-3 rounded-xl bg-accent/30">
                  <p className="text-2xl font-bold text-primary">{stats.journals}</p>
                  <p className="text-xs text-muted-foreground">Journal Entries</p>
                </div>
                <div className="p-3 rounded-xl bg-accent/30">
                  <p className="text-2xl font-bold text-primary">{stats.routines}</p>
                  <p className="text-xs text-muted-foreground">Routines</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AppLayout>
  );
}
