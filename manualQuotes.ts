// convex/manualQuotes.ts
import { mutation, query } from "convex/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";

async function requireUser(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Unauthorized");
  return identity;
}
async function requireAdmin(ctx: any) {
  const identity = await requireUser(ctx);
  const role =
    (identity as any).orgRole ||
    (identity as any).role ||
    (identity as any).publicMetadata?.role;
  if (role !== "admin" && role !== "org:admin") throw new Error("Admin privileges required");
  return identity;
}

const QuoteStatus = v.union(
  v.literal("draft"),
  v.literal("sent"),
  v.literal("accepted"),
  v.literal("rejected"),
  v.literal("expired"),
  v.literal("cancelled")
);

const QuoteItem = v.object({
  description: v.string(),
  qty: v.number(),
  unitPrice: v.number(),
  partId: v.optional(v.id("parts"))
});

function calcTotals(items: { qty: number; unitPrice: number }[], labor = 0, taxRate = 0) {
  const subtotal =
    items.reduce((sum, it) => sum + (it.qty ?? 0) * (it.unitPrice ?? 0), 0) + (labor ?? 0);
  const tax = +(subtotal * (taxRate ?? 0)).toFixed(2);
  const total = +(subtotal + tax).toFixed(2);
  return { subtotal: +subtotal.toFixed(2), tax, total };
}

export const create = mutation({
  args: v.object({
    draftId: v.optional(v.id("intakeDrafts")),
    title: v.string(),
    customerName: v.string(),
    contactEmail: v.optional(v.string()),
    contactPhone: v.optional(v.string()),
    items: v.array(QuoteItem),
    labor: v.optional(v.number()),
    taxRate: v.optional(v.number()),
    notes: v.optional(v.string()),
    status: v.optional(QuoteStatus),
    metadata: v.optional(v.any())
  }),
  handler: async (ctx, args) => {
    const identity = await requireUser(ctx);
    const now = Date.now();
    const { subtotal, tax, total } = calcTotals(args.items, args.labor ?? 0, args.taxRate ?? 0);
    const _id = await ctx.db.insert("manualQuotes", {
      ...args,
      status: (args.status as any) ?? "draft",
      totals: { subtotal, tax, total },
      createdBy: identity.subject,
      updatedBy: identity.subject,
      createdAt: now,
      updatedAt: now,
      archivedAt: null
    });
    return _id;
  }
});

export const update = mutation({
  args: v.object({
    id: v.id("manualQuotes"),
    patch: v.object({
      title: v.optional(v.string()),
      customerName: v.optional(v.string()),
      contactEmail: v.optional(v.string()),
      contactPhone: v.optional(v.string()),
      items: v.optional(v.array(QuoteItem)),
      labor: v.optional(v.number()),
      taxRate: v.optional(v.number()),
      notes: v.optional(v.string()),
      status: v.optional(QuoteStatus),
      metadata: v.optional(v.any())
    })
  }),
  handler: async (ctx, { id, patch }) => {
    const identity = await requireUser(ctx);
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("Quote not found");

    let totals = existing.totals;
    const items = patch.items ?? existing.items;
    const labor = patch.labor ?? existing.labor ?? 0;
    const taxRate = patch.taxRate ?? existing.taxRate ?? 0;
    if (patch.items || patch.labor !== undefined || patch.taxRate !== undefined) {
      totals = calcTotals(items, labor, taxRate);
    }

    await ctx.db.patch(id, {
      ...patch,
      totals,
      updatedAt: Date.now(),
      updatedBy: identity.subject
    });
    return id;
  }
});

export const archive = mutation({
  args: v.object({ id: v.id("manualQuotes") }),
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);
    const doc = await ctx.db.get(id);
    if (!doc) throw new Error("Quote not found");
    if (doc.archivedAt) return id;
    await ctx.db.patch(id, { archivedAt: Date.now() });
    return id;
  }
});

export const restore = mutation({
  args: v.object({ id: v.id("manualQuotes") }),
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);
    const doc = await ctx.db.get(id);
    if (!doc) throw new Error("Quote not found");
    await ctx.db.patch(id, { archivedAt: null });
    return id;
  }
});

export const remove = mutation({
  args: v.object({ id: v.id("manualQuotes") }),
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);
    await ctx.db.delete(id);
    return true;
  }
});

export const getById = query({
  args: v.object({ id: v.id("manualQuotes") }),
  handler: async (ctx, { id }) => {
    const doc = await ctx.db.get(id);
    if (!doc) return null;
    return doc;
  }
});

export const getAll = query({
  args: v.object({
    includeArchived: v.optional(v.boolean()),
    status: v.optional(QuoteStatus),
    limit: v.optional(v.number()),
    search: v.optional(v.string())
  }),
  handler: async (ctx, { includeArchived, status, limit, search }) => {
    let q = ctx.db.query("manualQuotes");
    if (!includeArchived) q = q.filter((q) => q.eq(q.field("archivedAt"), null));
    if (status) q = q.filter((q) => q.eq(q.field("status"), status));

    let items = await q.order("desc", (q) => q.field("updatedAt")).take(limit ?? 100);

    if (search && search.trim()) {
      const s = search.toLowerCase();
      items = items.filter((d: any) => {
        return (
          d.title?.toLowerCase().includes(s) ||
          d.customerName?.toLowerCase().includes(s) ||
          d.notes?.toLowerCase?.().includes(s)
        );
      });
    }
    return items;
  }
});

export const getTrash = query({
  args: v.object({ limit: v.optional(v.number()) }),
  handler: async (ctx, { limit }) => {
    const items = await ctx.db
      .query("manualQuotes")
      .filter((q) => q.neq(q.field("archivedAt"), null))
      .order("desc", (q) => q.field("archivedAt"))
      .take(limit ?? 100);
    return items;
  }
});
