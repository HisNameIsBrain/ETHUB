cd /root/AI/ETHUB

cat > convex/seed.ts <<'TS'
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const insertInventoryPart = mutation({
  args: v.object({
    name: v.string(),
    device: v.optional(v.string()),
    category: v.optional(v.string()),
    compatibleModels: v.optional(v.array(v.string())),
    condition: v.optional(v.string()),
    cost: v.optional(v.number()),
    price: v.optional(v.number()),
    currency: v.optional(v.string()),
    sku: v.optional(v.string()),
    vendor: v.optional(v.string()),
    vendorSku: v.optional(v.string()),
    stock: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
    metadata: v.optional(
      v.object({
        category: v.optional(v.string()),
        device: v.optional(v.string()),
        notes: v.optional(v.string()),
        originalCondition: v.optional(v.string()),
        partNumber: v.optional(v.string()),
        source: v.optional(v.string()),
        vendorSku: v.optional(v.string()),
      })
    ),
    createdBy: v.optional(v.string()),
    updatedBy: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),
  handler: async (ctx, args) => ctx.db.insert("inventoryParts", args),
});

export const addPartsDoc = mutation({
  args: v.object({
    parts: v.array(
      v.object({
        query: v.optional(v.string()),
        title: v.string(),
        device: v.optional(v.string()),
        partPrice: v.optional(v.number()),
        labor: v.optional(v.number()),
        total: v.optional(v.number()),
        type: v.optional(v.string()),
        eta: v.optional(v.string()),
        image: v.optional(v.string()),
        source: v.optional(v.string()),
        createdAt: v.optional(v.number()),
        updatedAt: v.number(),
      })
    ),
    images: v.array(
      v.object({
        url: v.optional(v.string()),
        title: v.optional(v.string()),
        link: v.optional(v.string()),
        mime: v.optional(v.string()),
        thumbnail: v.optional(v.string()),
        contextLink: v.optional(v.string()),
        alt: v.optional(v.string()),
      })
    ),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  }),
  handler: async (ctx, args) => ctx.db.insert("parts", args),
});

export const insertIntakeDraft = mutation({
  args: v.object({
    customerName: v.string(),
    contact: v.object({
      phone: v.optional(v.string()),
      email: v.optional(v.string()),
      preferred: v.optional(v.union(v.literal("phone"), v.literal("email"))),
    }),
    deviceModel: v.string(),
    issueDescription: v.string(),
    requestedService: v.optional(v.string()),
    notes: v.optional(v.string()),
    status: v.optional(
      v.union(v.literal("draft"), v.literal("submitted"), v.literal("cancelled"))
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
    createdBy: v.optional(v.string()),
    updatedBy: v.optional(v.string()),
  }),
  handler: async (ctx, args) => ctx.db.insert("intakeDrafts", args),
});

export const insertInvoice = mutation({
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
  handler: async (ctx, args) => ctx.db.insert("invoices", args),
});

export const clearInventoryParts = mutation({
  args: {},
  handler: async (ctx) => {
    const cur = ctx.db.query("inventoryParts");
    for await (const d of cur) await ctx.db.delete(d._id);
    return { ok: true };
  },
});

export const clearPartsDocs = mutation({
  args: {},
  handler: async (ctx) => {
    const cur = ctx.db.query("parts");
    for await (const d of cur) await ctx.db.delete(d._id);
    return { ok: true };
  },
});

export const clearIntakeDrafts = mutation({
  args: {},
  handler: async (ctx) => {
    const cur = ctx.db.query("intakeDrafts");
    for await (const d of cur) await ctx.db.delete(d._id);
    return { ok: true };
  },
});

export const clearInvoices = mutation({
  args: {},
  handler: async (ctx) => {
    const cur = ctx.db.query("invoices");
    for await (const d of cur) await ctx.db.delete(d._id);
    return { ok: true };
  },
});

export const clearAllSeedData = mutation({
  args: {},
  handler: async (ctx) => {
    await Promise.all([
      (async () => {
        const cur = ctx.db.query("inventoryParts");
        for await (const d of cur) await ctx.db.delete(d._id);
      })(),
      (async () => {
        const cur = ctx.db.query("parts");
        for await (const d of cur) await ctx.db.delete(d._id);
      })(),
      (async () => {
        const cur = ctx.db.query("intakeDrafts");
        for await (const d of cur) await ctx.db.delete(d._id);
      })(),
      (async () => {
        const cur = ctx.db.query("invoices");
        for await (const d of cur) await ctx.db.delete(d._id);
      })(),
    ]);
    return { ok: true };
  },
});
TS
