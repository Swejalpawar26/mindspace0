import { Smile, Frown, Angry, AlertTriangle, Minus } from "lucide-react";

const emotionConfig: Record<string, { icon: any; colorClass: string; label: string }> = {
  happy: { icon: Smile, colorClass: "text-emotion-happy bg-emotion-happy/15", label: "Happy" },
  sad: { icon: Frown, colorClass: "text-emotion-sad bg-emotion-sad/15", label: "Sad" },
  angry: { icon: Angry, colorClass: "text-emotion-angry bg-emotion-angry/15", label: "Angry" },
  anxious: { icon: AlertTriangle, colorClass: "text-emotion-anxious bg-emotion-anxious/15", label: "Anxious" },
  neutral: { icon: Minus, colorClass: "text-emotion-neutral bg-emotion-neutral/15", label: "Neutral" },
};

const intensityLabel: Record<string, string> = { low: "Low", medium: "Med", high: "High" };

interface EmotionBadgeProps {
  emotion: string;
  intensity?: string;
}

export function EmotionBadge({ emotion, intensity }: EmotionBadgeProps) {
  const config = emotionConfig[emotion] || emotionConfig.neutral;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.colorClass}`}>
      <Icon className="w-3 h-3" />
      {config.label}
      {intensity && <span className="opacity-70">· {intensityLabel[intensity] || intensity}</span>}
    </span>
  );
}
