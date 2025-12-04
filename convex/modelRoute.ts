import { OPENAI_MODEL_OPTIONS } from "./openaiModels";

type TaskType = "light" | "heavy" | "reasoning";

export function pickModel(task: TaskType): string {
  switch (task) {
    case "light":
      // quick, cheap, small prompts
      return "gpt-4.1-mini";
    case "reasoning":
      // multi-step, “think harder” tasks
      return "o3-mini";
    case "heavy":
    default:
      // longer contexts, nuanced responses
      return "gpt-4.1";
  }
}
