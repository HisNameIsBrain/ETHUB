// convex/services.ts
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

const now = () => Date.now();

export const create = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    priceCents: v.number(),
    description: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    sortOrder: v.optional(v.number()),
    category: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    button: v.optional(
      v.object({
        variant: v.optional(v.union(v.literal("default"), v.literal("secondary"), v.literal("outline"), v.literal("ghost"))),
        label: v.string(),
        href: v.string(),
      })
    ),
    isPublished: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    const doc = {
      ...args,
      isPublished: args.isPublished ?? false,
      archived: false as boolean,
      createdAt: now(),
      updatedAt: now(),
    };
    const id = await ctx.db.insert("services", doc as any);
    return id;
  },
});

export const update = mutation({
  args: {
    id: v.id("services"),
    name: v.optional(v.string()),
    slug: v.optional(v.string()),
    priceCents: v.optional(v.number()),
    description: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    sortOrder: v.optional(v.number()),
    category: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    button: v.optional(
      v.object({
        variant: v.optional(v.union(v.literal("default"), v.literal("secondary"), v.literal("outline"), v.literal("ghost"))),
        label: v.string(),
        href: v.string(),
      })
    ),
    isPublished: v.optional(v.boolean()),
    archived: v.optional(v.boolean()),
  },
  handler: async (ctx, { id, ...patch }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    await ctx.db.patch(id, { ...patch, updatedAt: now() } as any);
    return await ctx.db.get(id);
  },
});

export const archive = mutation({
  args: { id: v.id("services") },
  handler: async (ctx, { id }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    await ctx.db.patch(id, { archived: true, updatedAt: now() } as any);
    return id;
  },
});

export const restore = mutation({
  args: { id: v.id("services") },
  handler: async (ctx, { id }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    await ctx.db.patch(id, { archived: false, updatedAt: now() } as any);
    return id;
  },
});

export const remove = mutation({
  args: { id: v.id("services") },
  handler: async (ctx, { id }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    await ctx.db.delete(id);
    return id;
  },
});

export const getById = query({
  args: { id: v.id("services") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

export const getAll = query({
  args: {
    q: v.optional(v.string()),
    includeUnpublished: v.optional(v.boolean()),
  },
  handler: async (ctx, { q, includeUnpublished }) => {
    const term = q?.toLowerCase().trim() || "";
    const rows = await ctx.db.query("services").collect();
    return rows
      .filter((r: any) => !r.archived)
      .filter((r: any) => (includeUnpublished ? true : r.isPublished === true))
      .filter((r: any) =>
        term
          ? [r.name, r.description, r.category, (r.tags || []).join(" ")].some((f) =>
              typeof f === "string" ? f.toLowerCase().includes(term) : false
            )
          : true
      )
      .sort((a: any, b: any) =>
        (a.sortOrder ?? Number.MAX_SAFE_INTEGER) - (b.sortOrder ?? Number.MAX_SAFE_INTEGER)
      );
  },
});

export const getTrash = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query("services").collect();
    return rows.filter((r: any) => r.archived);
  },
});

export const getPublic = query({
  args: { q: v.optional(v.string()) },
  handler: async (ctx, { q }) => {
    const term = q?.toLowerCase().trim() || "";
    const rows = await ctx.db.query("services").collect();
    return rows
      .filter((r: any) => r.isPublished === true && !r.archived)
      .filter((r: any) =>
        term
          ? [r.name, r.description, r.category, (r.tags || []).join(" ")].some((f) =>
              typeof f === "string" ? f.toLowerCase().includes(term) : false
            )
          : true
      )
      .sort((a: any, b: any) =>
        (a.sortOrder ?? Number.MAX_SAFE_INTEGER) - (b.sortOrder ?? Number.MAX_SAFE_INTEGER)
      );
  },
});

// in convex/services.ts
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    return await ctx.db
      .query("services")
      .withIndex("by_slug", (q: any) => q.eq("slug", slug)) // ← fix here
      .unique();
  },
});
