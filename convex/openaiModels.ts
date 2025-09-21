export const OPENAI_MODEL_OPTIONS = [
  "gpt-4o-mini",
  "gpt-4o",
  "gpt-4.1-mini",
  "gpt-4.1",
  "o3-mini",
  "o4-mini"
] as const;

export type OpenAIModel = typeof OPENAI_MODEL_OPTIONS[number];
export const DEFAULT_MODEL: OpenAIModel = "gpt-4o-mini";
