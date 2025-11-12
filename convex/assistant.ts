// convex/assistant.ts
import { action } from "./_generated/server";
import { v } from "convex/values";

export const ask = action({
  args: { text: v.string() },
  handler: async (ctx, { text }) => {
    // Example: forward to OpenAI
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: text }],
      }),
    });

    const data = await res.json();
    return data.choices?.[0]?.message?.content ?? "No reply.";
  },
});
