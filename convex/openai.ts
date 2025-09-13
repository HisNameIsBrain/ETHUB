import OpenAI from "openai";
import { v } from "convex/values";
import { action, mutation, type ActionCtx } from "./_generated/server"; // <-- add this

const OPENAI_MODELS = new Set([
  "gpt-4o-mini",
  "gpt-4o",
  "gpt-4.1-mini",
  "gpt-4.1",
  "o3-mini",
]);

const audioFormatValidator = v.union(
  v.literal("mp3"),
  v.literal("wav"),
  v.literal("ogg"),
  v.literal("pcm")
);

const DEFAULT_MODEL = "gpt-4o-mini";

export const chat = action({
  args: {
    messages: v.array(v.object({ role: v.string(), content: v.string() })),
    model: v.optional(v.string()),
    temperature: v.optional(v.number()),
    system: v.optional(v.string()),
  },
  handler: async (ctx, { messages, model = DEFAULT_MODEL, temperature = 0.4, system }) => {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const msgs =
      system && system.trim()
        ? [{ role: "system", content: system }, ...messages]
        : messages;
    const res = await client.chat.completions.create({
      model,
      messages: msgs as any,
      temperature,
    });
    const content = res.choices?.[0]?.message?.content ?? "";
    return { content, model: res.model, usage: res.usage ?? null };
  },
});

export const moderate = action({
  args: { text: v.string() },
  handler: async (ctx, { text }) => {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const out = await client.moderations.create({
      model: "omni-moderation-latest",
      input: text,
    });
    const r = out.results?.[0] ?? null;
    return {
      flagged: !!r?.flagged,
      categories: r?.categories ?? null,
      scores: r?.category_scores ?? null,
    };
  },
});


export const ask = mutation({
  args: {
    prompt: v.string(),
    model: v.optional(v.string()),
    system: v.optional(v.string()),
    voice: v.optional(v.string()),              // metadata only
    audioFormat: v.optional(audioFormatValidator),
    temperature: v.optional(v.number()),
  },
  handler: async (
    ctx,
    {
      prompt,
      model = "gpt-4o-mini",
      system,
      voice,
      audioFormat = "mp3",
      temperature = 0.2,
    }
  ) => {
    if (!process.env.OPENAI_API_KEY) throw new Error("Missing OPENAI_API_KEY");
    if (!OPENAI_MODELS.has(model)) throw new Error(`Unsupported model: ${model}`);

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const messages: OpenAI.ChatCompletionMessageParam[] = [];
    if (system?.trim()) messages.push({ role: "system", content: system });
    messages.push({ role: "user", content: prompt });

    const chat = await client.chat.completions.create({
      model,
      messages,
      temperature,
    });

    const text = chat.choices?.[0]?.message?.content ?? "";

    return {
      text,
      modelUsed: model,
      tts: voice ? { requested: true, voice, format: audioFormat } : { requested: false },
    };
  },
});
