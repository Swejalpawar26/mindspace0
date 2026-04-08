import { AlertTriangle, Phone } from "lucide-react";
import { motion } from "framer-motion";

const helplines = [
  { name: "iCall", number: "9152987821", desc: "Mon-Sat, 8am-10pm" },
  { name: "Vandrevala Foundation", number: "18602662345", desc: "24/7, multilingual" },
  { name: "NIMHANS", number: "080-46110007", desc: "Mon-Sat, 9:30am-4:30pm" },
  { name: "Snehi", number: "044-24640050", desc: "24/7" },
];

export function CrisisAlert({ onDismiss }: { onDismiss: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="mx-4 mb-3 bg-destructive/10 border border-destructive/30 rounded-2xl p-4"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-destructive">Please seek professional help</p>
          <p className="text-xs text-foreground/80 mt-1">
            I care about you. If you're in crisis, please reach out to one of these helplines:
          </p>
          <div className="mt-3 space-y-2">
            {helplines.map((h) => (
              <a
                key={h.number}
                href={`tel:${h.number}`}
                className="flex items-center gap-2 bg-card rounded-xl p-2.5 hover:bg-muted transition-colors"
              >
                <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">{h.name}</p>
                  <p className="text-xs text-muted-foreground">{h.number} · {h.desc}</p>
                </div>
              </a>
            ))}
          </div>
          <button
            onClick={onDismiss}
            className="text-xs text-muted-foreground hover:text-foreground mt-2 underline"
          >
            I understand, dismiss
          </button>
        </div>
      </div>
    </motion.div>
  );
}

const CRISIS_PATTERNS = [
  /\b(want to die|wanna die|kill myself|end my life|suicide|suicidal)\b/i,
  /\b(i feel hopeless|no reason to live|can'?t go on|give up on life)\b/i,
  /\b(self[- ]?harm|hurt myself|cutting myself)\b/i,
  /\b(no one cares|better off dead|don'?t want to live)\b/i,
];

export function detectCrisis(message: string): boolean {
  return CRISIS_PATTERNS.some((pattern) => pattern.test(message));
}
