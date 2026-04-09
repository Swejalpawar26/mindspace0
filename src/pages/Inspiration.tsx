import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Quote, Star, Sparkles, BookOpen } from "lucide-react";
import { DailyQuote } from "@/components/DailyQuote";

interface Story {
  id: string;
  title: string;
  name: string;
  category: "entrepreneur" | "scientist" | "athlete" | "spiritual";
  summary: string;
  image: string;
  fullStory: string;
  challenges: string[];
  lessons: string[];
  quote: string;
  mindsetTip: string;
}

const STORIES: Story[] = [
  {
    id: "1",
    title: "From Rejection to Revolution",
    name: "Steve Jobs",
    category: "entrepreneur",
    summary: "Fired from his own company, then built the most valuable brand in the world.",
    image: "🍎",
    fullStory: "Steve Jobs co-founded Apple in his parents' garage at age 21. By 30, he was ousted from the company he created. Instead of giving up, he founded NeXT and Pixar, which became a massive success. When Apple was on the brink of bankruptcy, they brought him back. He then revolutionized music (iPod), phones (iPhone), and tablets (iPad). His journey proves that setbacks are setups for comebacks.",
    challenges: ["Fired from Apple at 30", "Failed NeXT computer hardware", "Battled pancreatic cancer", "Faced public criticism constantly"],
    lessons: ["Stay hungry, stay foolish", "Connect the dots looking backward", "Quality over quantity in everything", "Innovation requires saying no to 1000 things"],
    quote: "Your time is limited, don't waste it living someone else's life.",
    mindsetTip: "When facing rejection, ask yourself: 'What can I create from this?' Every 'no' redirects you to a better 'yes'.",
  },
  {
    id: "2",
    title: "The Quiet Genius Who Changed the World",
    name: "Marie Curie",
    category: "scientist",
    summary: "First woman to win a Nobel Prize, and the only person to win in two different sciences.",
    image: "⚗️",
    fullStory: "Born in Poland when women couldn't attend university, Marie Curie moved to Paris with almost no money. She studied physics and math, often skipping meals. She discovered radioactivity, polonium, and radium. She won two Nobel Prizes — in Physics and Chemistry. During WWI, she developed mobile X-ray units. Despite facing sexism in academia, she never stopped pushing boundaries.",
    challenges: ["Poverty during early studies", "Sexism in 19th century academia", "Death of husband Pierre", "Health issues from radiation exposure"],
    lessons: ["Passion conquers poverty", "Break barriers others set for you", "Persistence in the face of prejudice", "Science serves humanity"],
    quote: "Nothing in life is to be feared, it is only to be understood.",
    mindsetTip: "When you feel limited by circumstances, remember: your curiosity is your superpower. Keep learning, no matter what.",
  },
  {
    id: "3",
    title: "The Greatest of All Time",
    name: "Michael Jordan",
    category: "athlete",
    summary: "Cut from his high school team, became the most iconic basketball player ever.",
    image: "🏀",
    fullStory: "Michael Jordan was cut from his high school varsity basketball team. That rejection fueled an obsession with improvement. He practiced relentlessly, earned a scholarship to UNC, and was drafted by the Chicago Bulls. He won 6 NBA championships, 5 MVP awards, and became a global icon. His secret? He embraced failure as fuel and outworked everyone around him.",
    challenges: ["Cut from high school team", "Father's murder in 1993", "Failed baseball career", "Multiple playoff heartbreaks early on"],
    lessons: ["Failure is the best teacher", "Work ethic beats talent", "Embrace pressure situations", "Never stop improving"],
    quote: "I've failed over and over and over again in my life. And that is why I succeed.",
    mindsetTip: "Track your small wins daily. Every practice session, every effort counts. Success is built in the boring moments.",
  },
  {
    id: "4",
    title: "The Power of Nonviolence",
    name: "Mahatma Gandhi",
    category: "spiritual",
    summary: "Led India to independence through peace, proving that gentleness is true strength.",
    image: "🕊️",
    fullStory: "Mohandas Gandhi was a shy, average student who became a lawyer in South Africa. There, he experienced racism and injustice that transformed his life mission. He returned to India and led the independence movement through nonviolent civil disobedience — Salt March, fasting, peaceful protests. He inspired millions worldwide and proved that moral courage is the highest form of bravery.",
    challenges: ["Racism in South Africa", "Multiple imprisonments", "British Empire opposition", "Internal political conflicts"],
    lessons: ["Nonviolence requires more courage than violence", "Be the change you wish to see", "Simplicity is strength", "Persistence moves mountains"],
    quote: "In a gentle way, you can shake the world.",
    mindsetTip: "Practice one act of kindness today. Strength isn't about force — it's about consistency in doing what's right.",
  },
  {
    id: "5",
    title: "Dreaming Beyond Gravity",
    name: "Elon Musk",
    category: "entrepreneur",
    summary: "From bullied kid in South Africa to sending rockets to space and revolutionizing electric cars.",
    image: "🚀",
    fullStory: "Elon Musk was bullied so badly as a child he was hospitalized. He taught himself programming at 12, moved to Canada with almost nothing, and eventually co-founded PayPal. He invested everything into SpaceX and Tesla — both nearly went bankrupt. SpaceX's first three rockets exploded. But the fourth succeeded, and the rest is history. He now leads the charge for sustainable energy and interplanetary life.",
    challenges: ["Severe childhood bullying", "Three rocket failures at SpaceX", "Tesla nearly bankrupt in 2008", "Divorced, overworked, and publicly criticized"],
    lessons: ["Think in first principles", "Embrace calculated risk", "Long-term vision over short-term comfort", "Sleep at the factory if you must"],
    quote: "When something is important enough, you do it even if the odds are not in your favor.",
    mindsetTip: "Break your biggest goal into tiny first-principle steps. What's the absolute smallest action you can take today?",
  },
  {
    id: "6",
    title: "From Poverty to Nobel Peace",
    name: "Malala Yousafzai",
    category: "spiritual",
    summary: "Shot by the Taliban at 15 for advocating girls' education, became the youngest Nobel laureate.",
    image: "📖",
    fullStory: "Malala grew up in Pakistan's Swat Valley where the Taliban banned girls from attending school. At 11, she began blogging for the BBC about life under Taliban rule. At 15, a gunman shot her in the head on her school bus. She survived, recovered in the UK, and became a global advocate for education. At 17, she became the youngest-ever Nobel Peace Prize laureate.",
    challenges: ["Taliban death threats", "Shot in the head at 15", "Exile from homeland", "Global spotlight at a young age"],
    lessons: ["One voice can change the world", "Education is the most powerful weapon", "Fear is conquered by purpose", "Age is no barrier to impact"],
    quote: "One child, one teacher, one book, one pen can change the world.",
    mindsetTip: "What injustice bothers you most? Start speaking about it — even in small ways. Your voice matters more than you think.",
  },
];

const CATEGORY_LABELS: Record<string, string> = {
  entrepreneur: "🚀 Entrepreneur",
  scientist: "🔬 Scientist",
  athlete: "🏆 Athlete",
  spiritual: "🕊️ Spiritual Leader",
};

export default function Inspiration() {
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [filter, setFilter] = useState<string>("all");

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

        {/* Daily Quote */}
        <DailyQuote />

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 justify-center">
          {["all", "entrepreneur", "scientist", "athlete", "spiritual"].map((cat) => (
            <button key={cat} onClick={() => setFilter(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${filter === cat ? "bg-primary text-primary-foreground shadow-soft" : "bg-muted text-muted-foreground hover:bg-accent"}`}>
              {cat === "all" ? "✨ All" : CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>

        {/* Story Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((story, i) => (
            <motion.div key={story.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}>
              <Card className="fairy-card group cursor-pointer hover:shadow-lg hover:border-primary/30 transition-all duration-300 hover:-translate-y-1"
                onClick={() => setSelectedStory(story)}>
                <CardContent className="pt-5">
                  <div className="flex items-start gap-3">
                    <span className="text-4xl group-hover:scale-110 transition-transform duration-300">{story.image}</span>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs bg-accent/50 text-accent-foreground px-2 py-0.5 rounded-full">
                        {CATEGORY_LABELS[story.category]}
                      </span>
                      <h3 className="font-bold text-foreground mt-1 group-hover:text-primary transition-colors">{story.title}</h3>
                      <p className="text-sm text-primary font-medium">{story.name}</p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{story.summary}</p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-border/50">
                    <p className="text-xs italic text-muted-foreground">"{story.quote.slice(0, 60)}..."</p>
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
