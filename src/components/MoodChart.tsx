import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

interface MoodEntry {
  id: string;
  mood: string;
  intensity: string;
  created_at: string;
}

const moodScore: Record<string, number> = { happy: 5, neutral: 3, anxious: 2, sad: 1, angry: 1 };
const moodColor: Record<string, string> = {
  happy: "hsl(45 100% 60%)",
  sad: "hsl(220 70% 60%)",
  angry: "hsl(0 72% 55%)",
  anxious: "hsl(30 90% 55%)",
  neutral: "hsl(200 15% 60%)",
};

export function MoodChart({ entries }: { entries: MoodEntry[] }) {
  const [view, setView] = useState<"daily" | "weekly">("daily");

  const dailyData = useMemo(() => {
    const grouped: Record<string, { scores: number[]; counts: Record<string, number> }> = {};
    entries.forEach((e) => {
      const day = new Date(e.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      if (!grouped[day]) grouped[day] = { scores: [], counts: {} };
      grouped[day].scores.push(moodScore[e.mood] || 3);
      grouped[day].counts[e.mood] = (grouped[day].counts[e.mood] || 0) + 1;
    });
    return Object.entries(grouped)
      .map(([day, { scores }]) => ({
        name: day,
        score: Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10,
      }))
      .reverse()
      .slice(-7);
  }, [entries]);

  const weeklyData = useMemo(() => {
    const grouped: Record<string, number[]> = {};
    entries.forEach((e) => {
      const d = new Date(e.created_at);
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay());
      const key = weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(moodScore[e.mood] || 3);
    });
    return Object.entries(grouped)
      .map(([week, scores]) => ({
        name: week,
        score: Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10,
      }))
      .reverse()
      .slice(-4);
  }, [entries]);

  const freqData = useMemo(() => {
    const counts: Record<string, number> = {};
    entries.forEach((e) => {
      counts[e.mood] = (counts[e.mood] || 0) + 1;
    });
    return Object.entries(counts).map(([mood, count]) => ({
      name: mood,
      count,
      fill: moodColor[mood] || moodColor.neutral,
    }));
  }, [entries]);

  const chartData = view === "daily" ? dailyData : weeklyData;

  return (
    <Card className="shadow-card border-0 rounded-2xl h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Mood Trends</CardTitle>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant={view === "daily" ? "default" : "ghost"}
              className="rounded-lg text-xs h-7 px-3"
              onClick={() => setView("daily")}
            >
              Daily
            </Button>
            <Button
              size="sm"
              variant={view === "weekly" ? "default" : "ghost"}
              className="rounded-lg text-xs h-7 px-3"
              onClick={() => setView("weekly")}
            >
              Weekly
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {chartData.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-8">Chat more to see your mood trends! 📊</p>
        ) : (
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis domain={[0, 5]} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    fontSize: "12px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2.5}
                  dot={{ fill: "hsl(var(--primary))", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Emotion frequency bar */}
        {freqData.length > 0 && (
          <>
            <p className="text-sm font-semibold text-foreground">Emotion Frequency</p>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={freqData}>
                  <XAxis dataKey="name" tick={{ fontSize: 11, textTransform: "capitalize" } as any} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
