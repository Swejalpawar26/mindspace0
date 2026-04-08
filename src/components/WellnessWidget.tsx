import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wind, Sparkles, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const affirmations = [
  "I am worthy of love and kindness 💛",
  "I choose peace over worry today 🌿",
  "My feelings are valid and I honor them 🦋",
  "I am doing my best, and that's enough ✨",
  "I release what I cannot control 🕊️",
  "I am growing stronger every single day 🌱",
];

const exercises = [
  { name: "Box Breathing", steps: "Inhale 4s → Hold 4s → Exhale 4s → Hold 4s", duration: "2 min" },
  { name: "5-4-3-2-1 Grounding", steps: "5 things you see, 4 touch, 3 hear, 2 smell, 1 taste", duration: "3 min" },
  { name: "Body Scan", steps: "Slowly scan from head to toe, release tension", duration: "5 min" },
];

export function WellnessWidget() {
  const [showBreathing, setShowBreathing] = useState(false);
  const [breathPhase, setBreathPhase] = useState<"idle" | "inhale" | "hold" | "exhale">("idle");
  const [affirmation, setAffirmation] = useState(() => affirmations[Math.floor(Math.random() * affirmations.length)]);

  const startBreathing = () => {
    setShowBreathing(true);
    setBreathPhase("inhale");
    const cycle = () => {
      setBreathPhase("inhale");
      setTimeout(() => setBreathPhase("hold"), 4000);
      setTimeout(() => setBreathPhase("exhale"), 8000);
      setTimeout(() => setBreathPhase("hold"), 12000);
    };
    cycle();
    const interval = setInterval(cycle, 16000);
    setTimeout(() => {
      clearInterval(interval);
      setShowBreathing(false);
      setBreathPhase("idle");
    }, 48000); // 3 cycles
  };

  const newAffirmation = () => {
    setAffirmation(affirmations[Math.floor(Math.random() * affirmations.length)]);
  };

  return (
    <Card className="shadow-card border-0 rounded-2xl h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Wellness</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Breathing Exercise */}
        <AnimatePresence mode="wait">
          {showBreathing ? (
            <motion.div
              key="breathing"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center py-4"
            >
              <motion.div
                className="w-20 h-20 rounded-full gradient-calm flex items-center justify-center"
                animate={{
                  scale: breathPhase === "inhale" ? 1.3 : breathPhase === "exhale" ? 0.8 : 1,
                }}
                transition={{ duration: 4, ease: "easeInOut" }}
              >
                <Wind className="w-8 h-8 text-primary-foreground" />
              </motion.div>
              <p className="text-sm font-semibold text-foreground mt-3 capitalize">{breathPhase}</p>
              <p className="text-xs text-muted-foreground">Box Breathing</p>
            </motion.div>
          ) : (
            <motion.div key="button" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Button
                variant="outline"
                className="w-full rounded-xl justify-start gap-2"
                onClick={startBreathing}
              >
                <Wind className="w-4 h-4 text-primary" />
                Start Breathing Exercise
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Exercises List */}
        <div className="space-y-2">
          {exercises.map((ex) => (
            <div key={ex.name} className="bg-muted/50 rounded-xl p-3">
              <p className="text-sm font-medium text-foreground">{ex.name}</p>
              <p className="text-xs text-muted-foreground">{ex.steps}</p>
              <p className="text-xs text-primary mt-1">{ex.duration}</p>
            </div>
          ))}
        </div>

        {/* Affirmation */}
        <div className="bg-accent/40 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-semibold text-foreground">Daily Affirmation</span>
          </div>
          <AnimatePresence mode="wait">
            <motion.p
              key={affirmation}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="text-sm text-foreground"
            >
              {affirmation}
            </motion.p>
          </AnimatePresence>
          <Button variant="ghost" size="sm" className="mt-1 h-6 text-xs text-primary px-0" onClick={newAffirmation}>
            <Heart className="w-3 h-3 mr-1" /> New affirmation
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
