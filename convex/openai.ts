import { action } from "./_generated/server";
import { v } from "convex/values";
import OpenAI from "openai";

const OPENAI_MODELS = new Set([
  "gpt-4o",
  "gpt-4o-mini",
  "gpt-4.1",
  "gpt-4.1-mini",
  "o3-mini",
]);

type Msg = { role: "system" | "user" | "assistant"; content: string };

function assertModel(model: string) {
  if (!OPENAI_MODELS.has(model)) throw new Error(`Unsupported model: ${model}`);
}

export const chat = action({
  args: {
    messages: v.array(
      v.object({
        role: v.union(v.literal("system"), v.literal("user"), v.literal("assistant")),
        content: v.string(),
      })
    ),
    model: v.optional(v.string()),
    temperature: v.optional(v.number()),
  },
  handler: async (_ctx, { messages, model = "gpt-4o-mini", temperature = 0.7 }) => {
    assertModel(model);
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

    const resp = await client.chat.completions.create({
      model,
      messages,
      temperature,
    });

    return {
      model,
      content: resp.choices[0]?.message?.content ?? "",
    };
  },
});

export const ask = action({
  args: {
    prompt: v.string(),
    model: v.optional(v.string()),
    system: v.optional(v.string()),
    temperature: v.optional(v.number()),
  },
  handler: async (_ctx, { prompt, model = "gpt-4o-mini", system, temperature = 0.7 }) => {
    assertModel(model);
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

    const messages: Msg[] = [];
    if (system?.trim()) messages.push({ role: "system", content: system });
    messages.push({ role: "user", content: prompt });

    const resp = await client.chat.completions.create({
      model,
      messages,
      temperature,
    });

    return {
      model,
      content: resp.choices[0]?.message?.content ?? "",
    };
  },
});
