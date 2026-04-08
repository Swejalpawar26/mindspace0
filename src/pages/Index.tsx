import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, BarChart3, Shield } from "lucide-react";
import { motion } from "framer-motion";

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-calm opacity-10" />
        <div className="max-w-4xl mx-auto px-6 py-20 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full gradient-calm mb-6 shadow-soft">
              <Heart className="w-10 h-10 text-primary-foreground" />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4 leading-tight">
              Your Mind <br />Deserves Care
            </h1>
            <p className="text-lg text-muted-foreground max-w-md mx-auto mb-8">
              Talk to an AI companion that listens, understands, and helps you navigate your emotions. No judgment, just support. 🌿
            </p>
            <div className="flex gap-3 justify-center">
              <Link to="/signup">
                <Button size="lg" className="rounded-xl px-8 h-12 text-base font-semibold">
                  Get Started
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="rounded-xl px-8 h-12 text-base font-semibold">
                  Sign In
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-4xl mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: MessageCircle, title: "Safe Conversations", desc: "Chat with an empathetic AI that understands your feelings" },
            { icon: BarChart3, title: "Mood Tracking", desc: "Visualize your emotional patterns and growth over time" },
            { icon: Shield, title: "Private & Secure", desc: "Your conversations stay between you and MindSpace" },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.15 }}
              className="bg-card rounded-2xl p-6 shadow-card text-center"
            >
              <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center mx-auto mb-4">
                <f.icon className="w-6 h-6 text-accent-foreground" />
              </div>
              <h3 className="font-bold text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
