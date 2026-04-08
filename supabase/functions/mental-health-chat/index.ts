import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are MindSpace, a compassionate AI mental health companion. Your role:

1. EMOTIONAL SUPPORT: Be warm, empathetic, non-judgmental. Use a friendly Gen Z tone.
2. EMOTION DETECTION: Analyze the user's message and detect their primary emotion (happy, sad, angry, anxious, or neutral) and intensity (low, medium, high).
3. CONTEXTUAL RESPONSES:
   - If sad → Offer comfort, validate feelings, suggest gentle activities
   - If anxious → Guide breathing exercises, grounding techniques (5-4-3-2-1)
   - If angry → Acknowledge feelings, suggest cooling techniques
   - If happy → Celebrate with them, encourage positive habits
4. SUGGESTIONS: Recommend journaling, breathing exercises, walks, gratitude practice
5. BOUNDARIES: Never diagnose conditions. Never prescribe medication. If someone is in crisis, suggest professional help or hotlines.
6. PERSONALIZATION: Reference previous messages in the conversation to show you remember and care.

CRITICAL: You MUST respond with valid JSON in this exact format:
{
  "reply": "your supportive message here",
  "emotion": "happy|sad|angry|anxious|neutral",
  "emotion_intensity": "low|medium|high"
}

Keep responses concise (2-4 sentences) and genuine. Use emojis sparingly but warmly.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content || "";

    // Parse JSON from the response
    let parsed;
    try {
      // Try to extract JSON from the response (might have markdown code blocks)
      const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : rawContent);
    } catch {
      parsed = { reply: rawContent, emotion: "neutral", emotion_intensity: "low" };
    }

    return new Response(JSON.stringify({
      reply: parsed.reply || rawContent,
      emotion: parsed.emotion || "neutral",
      emotion_intensity: parsed.emotion_intensity || "medium",
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({
      reply: "I'm here for you, but I'm having a moment. Let's try again soon. 🌿",
      emotion: "neutral",
      emotion_intensity: "low",
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
