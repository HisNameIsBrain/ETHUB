// convex/services.ts
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/** Helpers */
function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

async function requireUser(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Unauthorized");
  return identity;
}

/** Assumes users: { userId: string, role?: 'admin'|'user' } */
async function isAdmin(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return false;
  const user = await ctx.db
    .query("users")
    .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
    .first();
  return user?.role === "admin";
}

async function assertAdmin(ctx: any) {
  if (!(await isAdmin(ctx))) throw new Error("Admin only");
}

/** Ensure unique slug per service name */
async function uniqueSlug(ctx: any, base: string) {
  let s = slugify(base) || "service";
  let candidate = s;
  let i = 2;
  while (true) {
    const existing = await ctx.db
      .query("services")
      .withIndex("by_slug", (q) => q.eq("slug", candidate))
      .first();
    if (!existing) return candidate;
    candidate = `${s}-${i++}`;
  }
}

/** Create */
export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    isPublic: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await assertAdmin(ctx);
    const identity = await requireUser(ctx);
    
    const slug = await uniqueSlug(ctx, args.name);
    const now = Date.now();
    
    const _id = await ctx.db.insert("services", {
      name: args.name,
      description: args.description ?? "",
      price: args.price ?? 0,
      isPublic: args.isPublic ?? true,
      archived: false,
      slug,
      createdAt: now,
      updatedAt: now,
      createdBy: identity.subject,
    });
    
    return { _id, slug };
  },
});

/** Update */
export const update = mutation({
  args: {
    id: v.id("services"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    isPublic: v.optional(v.boolean()),
  },
  handler: async (ctx, { id, ...patch }) => {
    await assertAdmin(ctx);
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("Service not found");
    
    let slug = existing.slug;
    if (patch.name && patch.name !== existing.name) {
      slug = await uniqueSlug(ctx, patch.name);
    }
    
    await ctx.db.patch(id, {
      ...patch,
      slug,
      updatedAt: Date.now(),
    });
    
    return { id, slug };
  },
});

/** Archive / Restore */
export const archive = mutation({
  args: { id: v.id("services") },
  handler: async (ctx, { id }) => {
    await assertAdmin(ctx);
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("Service not found");
    await ctx.db.patch(id, { archived: true, updatedAt: Date.now() });
    return { id, archived: true };
  },
});

export const restore = mutation({
  args: { id: v.id("services") },
  handler: async (ctx, { id }) => {
    await assertAdmin(ctx);
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("Service not found");
    await ctx.db.patch(id, { archived: false, updatedAt: Date.now() });
    return { id, archived: false };
  },
});

/** Remove */
export const remove = mutation({
  args: { id: v.id("services") },
  handler: async (ctx, { id }) => {
    await assertAdmin(ctx);
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("Service not found");
    await ctx.db.delete(id);
    return { id };
  },
});

/** Reads */
export const getById = query({
  args: { id: v.id("services") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

/** Public list */
export const getPublics = query({
  args: {
    search: v.optional(v.string()),
  },
  handler: async (ctx, { search = "" }) => {
    const results = await ctx.db
      .query("services")
      .withIndex("by_isPublic_archived", (q) =>
        q.eq("isPublic", true).eq("archived", false)
      )
      .order("desc")
      .collect();
    
    if (!search) return results;
    
    const term = search.toLowerCase();
    return results.filter(
      (s: any) =>
      s.name?.toLowerCase().includes(term) ||
      s.description?.toLowerCase().includes(term)
    );
  },
});

/** Admin: all non-archived */
export const getAll = query({
  args: {
    search: v.optional(v.string()),
  },
  handler: async (ctx, { search = "" }) => {
    if (!(await isAdmin(ctx))) throw new Error("Admin only");
    
    const results = await ctx.db
      .query("services")
      .filter((q: any) => q.eq(q.field("archived"), false))
      .order("desc")
      .collect();
    
    if (!search) return results;
    
    const term = search.toLowerCase();
    return results.filter(
      (s: any) =>
      s.name?.toLowerCase().includes(term) ||
      s.description?.toLowerCase().includes(term)
    );
  },
});

/** Admin: archived (trash) */
export const getTrash = query({
  args: {},
  handler: async (ctx) => {
    if (!(await isAdmin(ctx))) throw new Error("Admin only");
    
    return await ctx.db
      .query("services")
      .withIndex("by_archived", (q) => q.eq("archived", true))
      .order("desc")
      .collect();
  },
});

/** Helper: current user row by tokenIdentifier */
export const getUserByToken = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity?.tokenIdentifier) return null;
    
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .first();
    
    return user ?? null;
  },
});