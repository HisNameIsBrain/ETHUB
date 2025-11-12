// convex/invoices.ts
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

/**
 * CREATE
 * Inserts a new invoice. Expects all required fields defined in your schema.
 */
export const create = mutation({
  args: {
    ticketId: v.string(),
    name: v.union(v.string(), v.null()),
    email: v.union(v.string(), v.null()),
    phone: v.union(v.string(), v.null()),
    manufacturer: v.union(v.string(), v.null()),
    description: v.string(),
    quote: v.union(v.number(), v.null()),
    deposit: v.string(),
    service: v.string(),
    warrantyAcknowledged: v.boolean(),
    raw: v.any(),
    status: v.string(),      // "pending" | "processing" | "completed" | "canceled"
    createdAt: v.number(),   // Date.now()
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("invoices", args);
    return id; // Id<"invoices">
  },
});

/**
 * READ (filtered by statuses)
 * Returns invoices that match any of the provided statuses.
 * Sorted by createdAt desc (newest first).
 */
export const getInvoicesByStatuses = query({
  args: { statuses: v.array(v.string()) },
  handler: async (ctx, { statuses }) => {
    if (statuses.length === 0) return [];
    const out: any[] = [];
    for (const s of statuses) {
      const rows = await ctx.db
        .query("invoices")
        .withIndex("by_status", (q) => q.eq("status", s))
        .collect();
      out.push(...rows);
    }
    out.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
    return out;
  },
});

/**
 * LIST (latest N)
 * Uses by_created index to return newest first.
 */
export const list = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    const rows = await ctx.db
      .query("invoices")
      .withIndex("by_created")
      .order("desc")
      .take(limit ?? 100);
    return rows;
  },
});

/**
 * GET BY ID
 */
export const getById = query({
  args: { id: v.id("invoices") },
  handler: async (ctx, { id }) => {
    return (await ctx.db.get(id)) ?? null;
  },
});

/**
 * UPDATE
 * Patch only allowed fields. Keep the shape aligned with your table definition.
 */
export const update = mutation({
  args: {
    id: v.id("invoices"),
    updates: v.object({
      name: v.optional(v.union(v.string(), v.null())),
      email: v.optional(v.union(v.string(), v.null())),
      phone: v.optional(v.union(v.string(), v.null())),
      manufacturer: v.optional(v.union(v.string(), v.null())),
      description: v.optional(v.string()),
      quote: v.optional(v.union(v.number(), v.null())),
      deposit: v.optional(v.string()),
      service: v.optional(v.string()),
      warrantyAcknowledged: v.optional(v.boolean()),
      raw: v.optional(v.any()),
      status: v.optional(v.string()),
      createdAt: v.optional(v.number()),
    }),
  },
  handler: async (ctx, { id, updates }) => {
    await ctx.db.patch(id, updates);
    return id;
  },
});

/**
 * REMOVE
 */
export const remove = mutation({
  args: { id: v.id("invoices") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
    return id;
  },
});
