// convex/devSeed.ts
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const seedBasicNote = mutation({
  args: {},
  handler: async (ctx) => {
    const idt = await ctx.auth.getUserIdentity();
    if (!idt) throw new Error("unauthorized");

    const schemaId = await ctx.db.insert("propertySchemas", {
      name: "Basic Note",
      userId: idt.subject,
      fields: [
        { key: "tags", name: "Tags", type: "multi_select", options: [{ id: "work", name: "Work" }, { id: "personal", name: "Personal" }] },
        { key: "priority", name: "Priority", type: "select", options: [{ id: "low", name: "Low" }, { id: "high", name: "High" }] },
        { key: "done", name: "Done", type: "checkbox" },
        { key: "due", name: "Due", type: "date" },
      ],
    });

    const tplId = await ctx.db.insert("templates", {
      name: "Note",
      userId: idt.subject,
      contentTemplate: "# Title\n\nWrite here…",
      propertySchemaId: schemaId,
      defaultProperties: { done: false, tags: [] },
    });

    return { schemaId, tplId };
  },
});
