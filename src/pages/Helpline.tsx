import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Phone, Globe, Clock, Heart } from "lucide-react";
import { motion } from "framer-motion";

const helplines = [
  { name: "iCall", number: "9152987821", hours: "Mon-Sat, 8am-10pm", description: "Psychosocial helpline by TISS" },
  { name: "Vandrevala Foundation", number: "18602662345", hours: "24/7", description: "Free mental health helpline" },
  { name: "NIMHANS", number: "080-46110007", hours: "Mon-Sat, 9:30am-4:30pm", description: "National Institute of Mental Health" },
  { name: "Snehi", number: "044-24640050", hours: "24/7", description: "Emotional support helpline" },
  { name: "AASRA", number: "9820466726", hours: "24/7", description: "Crisis intervention center" },
  { name: "Jeevan Aastha", number: "18002333330", hours: "24/7", description: "Government suicide prevention helpline" },
  { name: "Connecting Trust", number: "9922001122", hours: "12pm-8pm", description: "Support for youth and students" },
  { name: "Mann Talks", number: "8686139139", hours: "9am-8pm", description: "Free and confidential mental health support" },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

export default function Helpline() {
  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto p-4 md:p-6 overflow-y-auto h-full">
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
          <motion.div variants={item} className="text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <Heart className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Helpline Numbers</h1>
            <p className="text-muted-foreground text-sm mt-2 max-w-md mx-auto">
              You are not alone. Reach out to these India-based helplines anytime you need support. 💙
            </p>
          </motion.div>

          <motion.div variants={item} className="bg-accent/40 p-4 rounded-2xl text-center">
            <p className="text-sm font-medium text-foreground">
              🚨 If you or someone you know is in immediate danger, please call <strong>112</strong> (Emergency) right away.
            </p>
          </motion.div>

          <div className="space-y-3">
            {helplines.map((h, i) => (
              <motion.div key={h.name} variants={item}>
                <Card className="shadow-card border-0 rounded-2xl hover:shadow-soft transition-all duration-300">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Phone className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-foreground">{h.name}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{h.description}</p>
                        <div className="flex flex-wrap items-center gap-3 mt-2">
                          <a
                            href={`tel:${h.number}`}
                            className="text-sm font-bold text-primary hover:underline"
                          >
                            📞 {h.number}
                          </a>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {h.hours}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
}
