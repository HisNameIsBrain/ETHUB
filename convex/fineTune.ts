"use node";

import OpenAI from "openai";
import { v } from "convex/values";
import { action } from "./_generated/server";
import * as fs from "node:fs";
import * as path from "node:path";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

// Helper: turn conversations into JSONL. Each item is { messages: [...] }
function toJSONL(convos: Array<{messages:{role:"system"|"user"|"assistant";content:string}[]}>){
  return convos.map(c => JSON.stringify({ messages: c.messages })).join("\n");
}

export const startFineTune = action({
  args: {
    // pass an array of conversations you collected server-side or from the client
    conversations: v.array(
      v.object({
        messages: v.array(
          v.object({ role: v.string(), content: v.string() })
        )
      })
    ),
    baseModel: v.optional(v.string()),   // e.g. "gpt-4o-mini"
    suffix: v.optional(v.string()),      // e.g. "ethub-assistant"
    seed: v.optional(v.number()),        // e.g. 314159
  },
  handler: async (ctx, args) => {
    const model = args.baseModel ?? "gpt-4o-mini";
    const suffix = args.suffix ?? "ethub-assistant";
    const seed = args.seed ?? 314159;

    // 1) Build JSONL in a temp file
    const jsonl = toJSONL(normalizeConversations(args.conversations));
    const tmpDir = "/tmp";
    const filePath = path.join(tmpDir, `dataset-${Date.now()}.jsonl`);
    fs.writeFileSync(filePath, jsonl, "utf8");

    // 2) Upload file to OpenAI → returns file-XXXX id
    const file = await openai.files.create({
      file: fs.createReadStream(filePath) as any,
      purpose: "fine-tune",
    });

    // 3) Create fine-tuning job
    const job = await openai.fineTuning.jobs.create({
      model,
      training_file: file.id,
      suffix,
      seed,
      // You can also pass hyperparameters: { n_epochs: 3, batch_size: "auto", learning_rate_multiplier: 1.0 }
    });

    // (optional) delete local tmp
    try { fs.unlinkSync(filePath); } catch {}

    // Return details you’ll want to show in UI
    return {
      training_file_id: file.id,
      job_id: job.id,
      base_model: model,
      // When the job finishes, OpenAI fills in job.fine_tuned_model
      // You can poll for that with another action.
    };
  }
});

type ChatRole = "user" | "system" | "assistant";
type NormalizedMsg = { role: ChatRole; content: string };
type NormalizedConv = { messages: NormalizedMsg[] };

/**
 * Coerce loose role strings to the allowed union for training JSONL.
 * Unknown roles are downgraded to "user".
 */
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
