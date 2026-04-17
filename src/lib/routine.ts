export interface AiRoutinePayload {
  time_slot?: string;
  title?: string;
  category?: string;
  icon?: string;
}

export interface ParsedRoutineTask {
  time_slot: string;
  title: string;
  category: string;
  icon: string;
}

export function parseRoutineAIResponse(reply: string): ParsedRoutineTask[] {
  const jsonMatch = reply.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error("Invalid response: no JSON array found");
  }

  const parsed = JSON.parse(jsonMatch[0]);
  if (!Array.isArray(parsed)) {
    throw new Error("Invalid response: payload is not an array");
  }

  return parsed.map((item: AiRoutinePayload, index: number) => ({
    time_slot: item.time_slot || `08:${index.toString().padStart(2, "0")}`,
    title: item.title || "Activity",
    category: item.category || "routine",
    icon: item.icon || "⭐",
  }));
}
