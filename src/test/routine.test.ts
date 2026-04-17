import { describe, it, expect } from "vitest";
import { parseRoutineAIResponse } from "../lib/routine";

describe("parseRoutineAIResponse", () => {
  it("parses a valid AI response and maps fields", () => {
    const reply = `Here is your plan:\n[\n  {"time_slot":"07:00","title":"Morning stretch","category":"exercise","icon":"🧘"},\n  {"time_slot":"08:00","title":"Study session","category":"study","icon":"📚"}\n]`;
    const tasks = parseRoutineAIResponse(reply);

    expect(tasks).toHaveLength(2);
    expect(tasks[0]).toEqual({ time_slot: "07:00", title: "Morning stretch", category: "exercise", icon: "🧘" });
    expect(tasks[1]).toEqual({ time_slot: "08:00", title: "Study session", category: "study", icon: "📚" });
  });

  it("throws when the AI response does not contain a JSON array", () => {
    expect(() => parseRoutineAIResponse("No valid payload here")).toThrow("Invalid response: no JSON array found");
  });

  it("applies default values when fields are missing", () => {
    const reply = `[{"title":"New task"}]`;
    const tasks = parseRoutineAIResponse(reply);

    expect(tasks).toHaveLength(1);
    expect(tasks[0]).toEqual({ time_slot: "08:00", title: "New task", category: "routine", icon: "⭐" });
  });
});
