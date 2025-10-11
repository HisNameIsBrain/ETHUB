import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// CREATE — add a new invoice
export const createInvoice = mutation({
  args: {
    ticketId: v.string(),
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    manufacturer: v.optional(v.string()),
    description: v.optional(v.string()),
    quote: v.number(),
    deposit: v.optional(v.string()),
    service: v.string(),
    warrantyAcknowledged: v.boolean(),
    status: v.string(),
    raw: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const createdAt = Date.now();
    const invoiceId = await ctx.db.insert("invoices", { ...args, createdAt });
    return invoiceId;
  },
});

// READ — get all invoices
export const listInvoices = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("invoices").order("desc").collect();
  },
});

// READ — get invoice by ID
export const getInvoice = query({
  args: { id: v.id("invoices") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// UPDATE — modify an existing invoice
export const updateInvoice = mutation({
  args: {
    id: v.id("invoices"),
    updates: v.object({
      name: v.optional(v.string()),
      phone: v.optional(v.string()),
      email: v.optional(v.string()),
      manufacturer: v.optional(v.string()),
      description: v.optional(v.string()),
      quote: v.optional(v.number()),
      deposit: v.optional(v.string()),
      service: v.optional(v.string()),
      warrantyAcknowledged: v.optional(v.boolean()),
      status: v.optional(v.string()),
      raw: v.optional(v.any()),
    }),
  },
  handler: async (ctx, { id, updates }) => {
    await ctx.db.patch(id, updates);
  },
});

// DELETE — remove an invoice
export const deleteInvoice = mutation({
  args: { id: v.id("invoices") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// HELPER — get invoices by status (e.g., “pending”, “paid”, “completed”)
export const getInvoicesByStatus = query({
  args: { status: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("invoices")
      .filter((q) => q.eq(q.field("status"), args.status))
      .order("desc")
      .collect();
  },
});
