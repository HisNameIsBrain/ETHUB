import { mutation } from "./_generated/server";
import { v } from "convex/values";
import OpenAI from "openai";

const OPENAI_MODELS = new Set([
  "gpt-4o",
  "gpt-4o-mini",
  "gpt-4.1-mini",
  "o3-mini",          // reasoning-lite
  "gpt-4.1",          // if you have access
]);

export const ask = mutation({
  args: {
    prompt: v.string(),
    model: v.optional(v.string()), // <-- new
    system: v.optional(v.string()),
  },
  handler: async (ctx, { prompt, model = "gpt-4o-mini", system }) => {
    if (!OPENAI_MODELS.has(model)) {
      throw new Error(`Unsupported model: ${model}`);
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];
    if (system?.trim()) messages.push({ role: "system", content: system! });
    messages.push({ role: "user", content: prompt });

    const resp = await client.chat.completions.create({
      model,
      messages,
      // temperature: 0.7, // tweak if you like
    });

    return {
      model,
      content: resp.choices[0]?.message?.content ?? "",
    };
  },
});
