// convex/fineTune.ts
"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import OpenAI from "openai";
import * as fs from "node:fs";
import * as path from "node:path";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

type ChatRole = "user" | "system" | "assistant";
type NormalizedMsg = { role: ChatRole; content: string };
type NormalizedConv = { messages: NormalizedMsg[] };

function normalizeConversations(
  input: { messages: { role: string; content: string }[] }[]
): NormalizedConv[] {
  const allowed: ChatRole[] = ["user", "system", "assistant"];
  return input.map(c => ({
    messages: c.messages.map(m => ({
      content: m.content,
      role: (allowed.includes(m.role as ChatRole) ? m.role : "user") as ChatRole
    }))
  }));
}

function toJSONL(convos: NormalizedConv[]){
  return convos.map(c => JSON.stringify({ messages: c.messages })).join("\n");
}

export const startFineTune = action({
  args: {
    conversations: v.array(
      v.object({
        messages: v.array(v.object({ role: v.string(), content: v.string() })),
      })
    ),
    baseModel: v.optional(v.string()),
    suffix: v.optional(v.string()),
    seed: v.optional(v.number()),
  },
  handler: async (_ctx, args) => {
    const model = args.baseModel ?? "gpt-4o-mini";
    const suffix = args.suffix ?? "ethub-assistant";
    const seed = args.seed ?? 314159;

    const jsonl = toJSONL(normalizeConversations(args.conversations));
    const tmpDir = "/tmp";
    const filePath = path.join(tmpDir, `dataset-${Date.now()}.jsonl`);
    fs.writeFileSync(filePath, jsonl, "utf8");

    const file = await openai.files.create({
      file: fs.createReadStream(filePath) as any,
      purpose: "fine-tune",
    });

    const job = await openai.fineTuning.jobs.create({
      model,
      training_file: file.id,
      suffix,
      seed,
    });

    try { fs.unlinkSync(filePath); } catch {}

    return {
      training_file_id: file.id,
      job_id: job.id,
      base_model: model,
    };
  }
});
