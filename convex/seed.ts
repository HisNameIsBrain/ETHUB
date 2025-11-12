import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

type SeedResult = {
  device: string;
  insertedInventory: number;
  insertedParts: number;
};

// ===================== CLEAR TABLES =====================
export const clearAllSeedData = mutation({
  args: {},
  handler: async (ctx) => {
    await Promise.all([
      (async () => {
        for await (const d of ctx.db.query("inventoryParts")) await ctx.db.delete(d._id);
      })(),
      (async () => {
        for await (const d of ctx.db.query("parts")) await ctx.db.delete(d._id);
      })(),
      (async () => {
        for await (const d of ctx.db.query("intakeDrafts")) await ctx.db.delete(d._id);
      })(),
      (async () => {
        for await (const d of ctx.db.query("invoices")) await ctx.db.delete(d._id);
      })(),
    ]);
    return { ok: true };
  },
});

// ===================== INSERT HELPERS =====================
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

// ===================== SEED PIPELINE =====================
export const ingestFromVendor = mutation({
  args: v.object({
    device: v.string(),
    count: v.optional(v.number()),
    reset: v.optional(v.boolean()),
  }),
  handler: async (ctx, { device, count = 6, reset = false }): Promise<SeedResult> => {
    if (reset) {
      await ctx.runMutation(api.seed.clearAllSeedData, {});
    }

    // pull data from MobileSentrix via existing pullSeedParts
    // @ts-expect-error: Convex FunctionReference cast
    const result = await ctx.runAction(api.actions.pullSeedParts, { device, count });

    return {
      device: result.device,
      insertedInventory: result.insertedInventory,
      insertedParts: result.insertedParts,
    };
  },
});
