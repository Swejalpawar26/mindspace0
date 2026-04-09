import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const CRISIS_PATTERNS = [
  "want to die", "wanna die", "kill myself", "end my life", "suicide", "suicidal",
  "feel hopeless", "no reason to live", "can't go on", "give up on life",
  "self harm", "self-harm", "hurt myself", "cutting myself",
  "no one cares", "better off dead", "don't want to live",
];

const SYSTEM_PROMPT = `You are MindSpace, a compassionate AI mental health companion. Your role:

1. EMOTIONAL SUPPORT: Be warm, empathetic, non-judgmental. Use a friendly Gen Z tone.
2. EMOTION DETECTION: Analyze the user's message and detect their primary emotion (happy, sad, angry, anxious, or neutral) and intensity (low, medium, high).
3. CONTEXTUAL RESPONSES:
   - If sad → Offer comfort, validate feelings, suggest gentle activities
   - If anxious → Guide breathing exercises, grounding techniques (5-4-3-2-1)
   - If angry → Acknowledge feelings, suggest cooling techniques
   - If happy → Celebrate with them, encourage positive habits
4. CHARACTER WISDOM: After your supportive reply, ALWAYS find a famous personality whose life experience relates to what the user is going through. Include a powerful quote from them and a short inspiring story of how they dealt with a similar situation. Examples:
   - Stress about exams → APJ Abdul Kalam's struggle with academics
   - Feeling like giving up → Thomas Edison's 1000 failures
   - Career confusion → Steve Jobs being fired from Apple
   - Loneliness → Nikola Tesla's solitary genius
   - Body image issues → Lizzo's self-love journey
   - Financial stress → JK Rowling writing Harry Potter while broke
   - Relationship pain → Frida Kahlo turning heartbreak into art
   - Fear of failure → Michael Jordan being cut from his school team
   - Feeling different → Albert Einstein failing in school
   - Spiritual crisis → Buddha leaving his palace to find meaning
5. CRISIS SUPPORT: If the user expresses suicidal thoughts or self-harm, respond with utmost care. Include helpline numbers:
   - iCall: 9152987821
   - Vandrevala Foundation: 18602662345 (24/7)
   - NIMHANS: 080-46110007
6. BOUNDARIES: Never diagnose conditions. Never prescribe medication.
7. PERSONALIZATION: Reference previous messages to show you remember and care.

CRITICAL: You MUST respond with valid JSON in this exact format:
{
  "reply": "your supportive message here",
  "emotion": "happy|sad|angry|anxious|neutral",
  "emotion_intensity": "low|medium|high",
  "character_quote": "the exact quote from the famous person",
  "character_name": "Name of the person",
  "character_story": "A 2-4 sentence story about how this person faced a similar challenge and what they did. Make it relatable and inspiring."
}

Keep the reply concise (2-3 sentences). The character story is separate and will be shown as a flash card. Use emojis sparingly but warmly.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const lastUserMsg = [...messages].reverse().find((m: any) => m.role === "user");
    const isCrisis = lastUserMsg && CRISIS_PATTERNS.some((p) =>
      lastUserMsg.content.toLowerCase().includes(p)
    );

    const systemMessages = [{ role: "system", content: SYSTEM_PROMPT }];
    if (isCrisis) {
      systemMessages.push({
        role: "system",
        content: "IMPORTANT: The user may be in crisis. Respond with extreme care, empathy, and include helpline numbers. Set emotion to 'sad' with intensity 'high'.",
      });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [...systemMessages, ...messages],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Credits exhausted. Please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content || "";

    let parsed;
    try {
      const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : rawContent);
    } catch {
      parsed = { reply: rawContent, emotion: "neutral", emotion_intensity: "low" };
    }

    return new Response(JSON.stringify({
      reply: parsed.reply || rawContent,
      emotion: parsed.emotion || "neutral",
      emotion_intensity: parsed.emotion_intensity || "medium",
      character_quote: parsed.character_quote || null,
      character_name: parsed.character_name || null,
      character_story: parsed.character_story || null,
      is_crisis: isCrisis || false,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({
      reply: "I'm here for you, but I'm having a moment. Let's try again soon. 🌿",
      emotion: "neutral",
      emotion_intensity: "low",
      character_quote: null,
      character_name: null,
      character_story: null,
      is_crisis: false,
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
