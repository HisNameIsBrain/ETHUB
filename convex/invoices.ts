// convex/invoices.ts
import { query } from "./_generated/server";
import { v } from "convex/values";

export const getInvoicesByStatuses = query({
  args: v.object({ statuses: v.array(v.string()), limitPerStatus: v.optional(v.number()) }),
  handler: async (ctx, { statuses, limitPerStatus = 100 }) => {
    const all: any[] = [];
    for (const s of statuses) {
      const rows = await ctx.db
        .query("invoices")
        .withIndex("by_status", (q) => q.eq("status", s))
        .take(limitPerStatus);
      all.push(...rows);
    }
    all.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
    return all;
  },
});

import { mutation } from "./_generated/server";

export const create = mutation({
  args: v.object({
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
    status: v.string(),
    createdAt: v.number(),
  }),
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("invoices", args);
    return { _id: id };
  },
});
