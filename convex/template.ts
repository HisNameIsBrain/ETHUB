// convex/templates.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    contentTemplate: v.optional(v.string()),
    propertySchemaId: v.optional(v.id("propertySchemas")),
    defaultProperties: v.optional(v.record(v.string(), v.any())),
    icon: v.optional(v.string()),
    coverImage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const idt = await ctx.auth.getUserIdentity();
    if (!idt) throw new Error("unauthorized");
    return await ctx.db.insert("templates", { ...args, userId: idt.subject });
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    const idt = await ctx.auth.getUserIdentity();
    if (!idt) throw new Error("unauthorized");
    return await ctx.db
      .query("templates")
      .withIndex("by_user", (q) => q.eq("userId", idt.subject))
      .collect();
  },
});

export const createDocumentFromTemplate = mutation({
  args: {
    title: v.string(),
    parentDocument: v.optional(v.id("documents")),
    templateId: v.id("templates"),
    overrides: v.optional(v.record(v.string(), v.any())),
  },
  handler: async (ctx, { title, parentDocument, templateId, overrides }) => {
    const idt = await ctx.auth.getUserIdentity();
    if (!idt) throw new Error("unauthorized");

    const tpl = await ctx.db.get(templateId);
    if (!tpl) throw new Error("template not found");

    const mergedProps = { ...(tpl.defaultProperties ?? {}), ...(overrides ?? {}) };

    const docId = await ctx.db.insert("documents", {
      title,
      content: tpl.contentTemplate ?? "",
      userId: idt.subject,
      parentDocument,
      templateId,
      propertySchemaId: tpl.propertySchemaId,
      properties: mergedProps,
      isArchived: false,
    });

    return docId;
  },
});
