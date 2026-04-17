import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowLeft, Quote, Star, Sparkles, BookOpen } from "lucide-react";
import { DailyQuote } from "@/components/DailyQuote";
import { STORIES, type InspirationStory } from "@/lib/inspiration";

type Story = InspirationStory;

const CATEGORY_LABELS: Record<string, string> = {
  entrepreneur: "🚀 Entrepreneur",
  scientist: "🔬 Scientist",
  athlete: "🏆 Athlete",
  spiritual: "🕊️ Spiritual Leader",
};

export default function Inspiration() {
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) {
      return;
    }
    const storyId = location.hash.replace("#", "");
    const story = STORIES.find((item) => item.id === storyId);

    if (story) {
      setSelectedStory(story);
      setTimeout(() => {
        document.getElementById(`story-${storyId}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
    }
  }, [location.hash]);

  const filtered = filter === "all" ? STORIES : STORIES.filter((s) => s.category === filter);

  if (selectedStory) {
    return (
      <AppLayout>
        <div className="max-w-3xl mx-auto p-4 md:p-6 overflow-y-auto h-full">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Button variant="ghost" onClick={() => setSelectedStory(null)} className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Hub
            </Button>

            <div className="text-center mb-6">
              <span className="text-6xl block mb-3">{selectedStory.image}</span>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">{selectedStory.title}</h1>
              <p className="text-primary font-semibold mt-1">{selectedStory.name}</p>
              <span className="text-xs bg-accent text-accent-foreground px-3 py-1 rounded-full mt-2 inline-block">
                {CATEGORY_LABELS[selectedStory.category]}
              </span>
            </div>

            <Card className="fairy-card mb-4">
              <CardContent className="pt-6">
                <div className="flex items-start gap-2 mb-4">
                  <BookOpen className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <h2 className="font-bold text-foreground">Full Story</h2>
                </div>
                <p className="text-foreground/80 leading-relaxed">{selectedStory.fullStory}</p>
              </CardContent>
            </Card>

            <Card className="fairy-card mb-4">
              <CardContent className="pt-6">
                <h3 className="font-bold text-foreground mb-3">⚡ Challenges Faced</h3>
                <ul className="space-y-2">
                  {selectedStory.challenges.map((c, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                      <span className="text-destructive mt-0.5">•</span> {c}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="fairy-card mb-4">
              <CardContent className="pt-6">
                <h3 className="font-bold text-foreground mb-3">💎 Lessons Learned</h3>
                <ul className="space-y-2">
                  {selectedStory.lessons.map((l, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                      <Star className="w-3 h-3 text-primary mt-1 flex-shrink-0" /> {l}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="fairy-card bg-gradient-to-br from-primary/5 to-accent/10 mb-4">
              <CardContent className="pt-6 text-center">
                <Quote className="w-8 h-8 text-primary mx-auto mb-3" />
                <blockquote className="text-lg font-semibold text-foreground italic">
                  "{selectedStory.quote}"
                </blockquote>
                <p className="text-sm text-muted-foreground mt-2">— {selectedStory.name}</p>
              </CardContent>
            </Card>

            <Card className="fairy-card border-primary/20">
              <CardContent className="pt-6">
                <h3 className="font-bold text-foreground mb-2 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" /> Apply This Mindset
                </h3>
                <p className="text-foreground/80 text-sm leading-relaxed">{selectedStory.mindsetTip}</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6 overflow-y-auto h-full">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center justify-center gap-2">
            <Sparkles className="w-7 h-7 text-primary" />
            Inspiration Hub
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Stories that ignite your inner fire ✨</p>
        </motion.div>

        <DailyQuote />

        <div className="flex flex-wrap gap-2 justify-center">
          {['all', 'entrepreneur', 'scientist', 'athlete', 'spiritual'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                filter === cat ? 'bg-primary text-primary-foreground shadow-soft' : 'bg-muted text-muted-foreground hover:bg-accent'
              }`}
            >
              {cat === 'all' ? '✨ All' : CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((story, i) => (
            <motion.div
              key={story.id}
              id={`story-${story.id}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -5, scale: 1.01 }}
              className="group"
            >
              <Card
                className="fairy-card cursor-pointer hover:shadow-lg hover:border-primary/30 transition-all duration-300"
                onClick={() => setSelectedStory(story)}
              >
                <CardContent className="space-y-4 p-6">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-4xl">{story.image}</span>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                      {CATEGORY_LABELS[story.category]}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">{story.title}</h2>
                    <p className="text-sm text-muted-foreground mt-1">{story.name}</p>
                  </div>
                  <p className="text-sm text-foreground/80 leading-relaxed">{story.summary}</p>
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-secondary/10 text-secondary px-3 py-1 text-xs font-medium">Tap to read more</span>
                    <span className="text-xs text-muted-foreground">#{story.id}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
