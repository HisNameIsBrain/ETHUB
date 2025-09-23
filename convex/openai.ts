// convex/openai.ts
import { action } from "./_generated/server";
import { v } from "convex/values";
import OpenAI from "openai";

// If you keep a central list, import it; otherwise define here.
// import { DEFAULT_MODEL } from "./openaiModels";
const DEFAULT_MODEL = "gpt-4o-mini" as const;

/* -------------------------- model allowlists -------------------------- */

const CHAT_MODELS = new Set(["gpt-4o-mini","gpt-4o","gpt-4.1-mini","gpt-4.1","o3-mini"]);
const TTS_MODELS  = new Set(["gpt-4o-mini-tts"]);

function assertChatModel(model: string) {
  if (!CHAT_MODELS.has(model)) throw new Error(`Unsupported chat model: ${model}`);
}
function assertTtsModel(model: string) {
  if (!TTS_MODELS.has(model)) throw new Error(`Unsupported TTS model: ${model}`);
}

/* ------------------------------ client ------------------------------- */

function getClient() {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("Missing OPENAI_API_KEY");
  return new OpenAI({ apiKey: key });
}

export const openai = getClient();

/* -------------------------------- TTS -------------------------------- */

export const speak = action({
  args: { text: v.string(), voice: v.optional(v.string()), model: v.optional(v.string()) },
  handler: async (_ctx, { text, voice = "verse", model = "gpt-4o-mini-tts" }) => {
    assertTtsModel(model);
    const client = getClient();
    // @ts-ignore older SDKs: 'format' type may lag behind runtime support
    const r = await client.audio.speech.create({ model, voice, input: text, format: "mp3" });
    const buf = Buffer.from(await r.arrayBuffer());
    return { audio: buf.toString("base64") }; // base64 MP3
  },
});

/* ------------------------------ Chat --------------------------------- */

type ChatMessage = { role: "user" | "system" | "assistant"; content: string };

export const chat = action({
  args: {
    messages: v.array(v.object({ role: v.string(), content: v.string() })), // runtime validated
    model: v.optional(v.string()),
    temperature: v.optional(v.number()),
    system: v.optional(v.string()),
  },
  handler: async (_ctx, { messages, model = DEFAULT_MODEL, temperature = 0.4, system }) => {
    assertChatModel(model);
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

/* ---------------------------- Moderation ----------------------------- */

export const moderate = action({
  args: { text: v.string() },
  handler: async (_ctx, { text }) => {
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

/* ------------------------------- Ask -------------------------------- */

const audioFormatValidator = v.union(
  v.literal("mp3"),
  v.literal("wav"),
  v.literal("ogg"),
  v.literal("pcm")
);

export const ask = action({
  args: {
    prompt: v.string(),
    model: v.optional(v.string()),
    system: v.optional(v.string()),
    voice: v.optional(v.string()),
    audioFormat: v.optional(audioFormatValidator),
    temperature: v.optional(v.number()),
  },
  handler: async (_ctx, { prompt, model = DEFAULT_MODEL, system, voice, audioFormat = "mp3", temperature = 0.2 }) => {
    assertChatModel(model);
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
      tts: voice ? { requested: true, voice, format: audioFormat } : { requested: false },
    };
  },
});
