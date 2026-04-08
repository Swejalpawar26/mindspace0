import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Quote } from "lucide-react";

const quotes = [
  { text: "You don't have to control your thoughts. You just have to stop letting them control you.", author: "Dan Millman" },
  { text: "It's okay to not be okay — as long as you don't give up.", author: "Karen Salmansohn" },
  { text: "Be patient with yourself. Nothing in nature blooms all year.", author: "Unknown" },
  { text: "Almost everything will work again if you unplug it for a few minutes, including you.", author: "Anne Lamott" },
  { text: "Your present circumstances don't determine where you can go; they merely determine where you start.", author: "Nido Qubein" },
  { text: "You are enough just as you are.", author: "Meghan Markle" },
  { text: "Feelings are just visitors. Let them come and go.", author: "Mooji" },
  { text: "Self-care is giving the world the best of you, instead of what's left of you.", author: "Katie Reed" },
  { text: "What mental health needs is more sunlight, more candor, and more unashamed conversation.", author: "Glenn Close" },
  { text: "Breathe. Let go. And remind yourself that this very moment is the only one you know you have for sure.", author: "Oprah Winfrey" },
];

export function DailyQuote() {
  const quote = useMemo(() => {
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
    );
    return quotes[dayOfYear % quotes.length];
  }, []);

  return (
    <Card className="shadow-card border-0 rounded-2xl gradient-calm">
      <CardContent className="p-5 flex items-start gap-3">
        <Quote className="w-6 h-6 text-primary-foreground/80 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-primary-foreground leading-relaxed">"{quote.text}"</p>
          <p className="text-xs text-primary-foreground/70 mt-1.5">— {quote.author}</p>
        </div>
      </CardContent>
    </Card>
  );
}
