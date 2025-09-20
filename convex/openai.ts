// convex/openai.ts
import OpenAI from "openai";
import { v } from "convex/values";
import { action, type ActionCtx } from "./_generated/server";

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

function getClient() {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("Missing OPENAI_API_KEY");
  return new OpenAI({ apiKey: key });
}

/** Shared guard so we fail fast on bad model names */
function assertModel(model: string) {
  if (!OPENAI_MODELS.has(model)) {
    throw new Error(`Unsupported model: ${model}`);
  }
}

/** Chat (multi-turn) — ACTION */
export const chat = action({
  args: {
    messages: v.array(v.object({ role: v.string(), content: v.string() })),
    model: v.optional(v.string()),
    temperature: v.optional(v.number()),
    system: v.optional(v.string()),
  },
  handler: async (
    ctx: ActionCtx,
    { messages, model = DEFAULT_MODEL, temperature = 0.4, system }
  ) => {
    assertModel(model);
    const client = getClient();

    const msgs =
      system && system.trim()
        ? ([{ role: "system", content: system }, ...messages] as any)
        : (messages as any);

    const res = await client.chat.completions.create({
      model,
      messages: msgs,
      temperature,
    });

    const content = res.choices?.[0]?.message?.content ?? "";
    return { content, model: res.model, usage: res.usage ?? null };
  },
});

/** Moderation — ACTION */
export const moderate = action({
  args: { text: v.string() },
  handler: async (ctx: ActionCtx, { text }) => {
    const client = getClient();
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

/** Ask (one-shot prompt) — ACTION */
export const ask = action({
  args: {
    prompt: v.string(),
    model: v.optional(v.string()),
    system: v.optional(v.string()),
    voice: v.optional(v.string()), // metadata only; TTS is handled on Next.js side
    audioFormat: v.optional(audioFormatValidator),
    temperature: v.optional(v.number()),
  },
  handler: async (
    ctx: ActionCtx,
    {
      prompt,
      model = DEFAULT_MODEL,
      system,
      voice,
      audioFormat = "mp3",
      temperature = 0.2,
    }
  ) => {
    assertModel(model);
    const client = getClient();

    const messages: OpenAI.ChatCompletionMessageParam[] = [];
    if (system?.trim()) messages.push({ role: "system", content: system });
    messages.push({ role: "user", content: prompt });

    const res = await client.chat.completions.create({
      model,
      messages,
      temperature,
    });

    const text = res.choices?.[0]?.message?.content ?? "";
    return {
      text,
      modelUsed: res.model ?? model,
      usage: res.usage ?? null,
      tts: voice
        ? { requested: true, voice, format: audioFormat }
        : { requested: false },
    };
  },
});
