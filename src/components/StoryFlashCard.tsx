import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown, ChevronUp, Sparkles } from "lucide-react";

interface StoryFlashCardProps {
  quote: string;
  character: string;
  story: string;
}

export function StoryFlashCard({ quote, character, story }: StoryFlashCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="my-2"
    >
      <Card
        className="border-0 rounded-2xl bg-gradient-to-br from-accent/60 to-primary/10 shadow-card hover:shadow-soft transition-all duration-300 cursor-pointer overflow-hidden"
        onClick={() => setExpanded(!expanded)}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-primary mb-1">💡 Wisdom from {character}</p>
              <p className="text-sm italic text-foreground leading-relaxed">"{quote}"</p>
              <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                <span>{expanded ? "Hide story" : "Read the story behind this"}</span>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="mt-3 pt-3 border-t border-border/50">
                  <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">{story}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}
