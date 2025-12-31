// convex/catalog.ts
import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

const money = v.object({
  amountCents: v.number(),
  currency: v.optional(v.string()),
});

const serviceDetails = v.object({
  durationMinutes: v.optional(v.number()),
  laborCostCents: v.optional(v.number()),
  requiresAppointment: v.boolean(),
  warrantyDays: v.optional(v.number()),
});

const productDetails = v.object({
  sku: v.optional(v.string()),
  stock: v.number(),
  costCents: v.optional(v.number()),
  vendor: v.optional(v.string()),
  warrantyDays: v.optional(v.number()),
});

const itemDetails = v.object({
  unit: v.optional(v.string()),
  quantityLimit: v.optional(v.number()),
  isDigital: v.optional(v.boolean()),
});

function assertKindConsistency(args: {
  kind: "service" | "product" | "item";
  service?: unknown;
  product?: unknown;
  item?: unknown;
}) {
  const count = Number(!!args.service) + Number(!!args.product) + Number(!!args.item);
  if (count > 1) throw new Error("Provide only one of: service, product, item.");
  if (args.kind === "service" && (args.product || args.item)) throw new Error("kind=service cannot include product/item.");
  if (args.kind === "product" && (args.service || args.item)) throw new Error("kind=product cannot include service/item.");
  if (args.kind === "item" && (args.service || args.product)) throw new Error("kind=item cannot include service/product.");
}

export const create = mutation({
  args: {
    kind: v.union(v.literal("service"), v.literal("product"), v.literal("item")),
    title: v.string(),
    description: v.optional(v.string()),
    price: v.optional(money),
    category: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    imageUrl: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    service: v.optional(serviceDetails),
    product: v.optional(productDetails),
    item: v.optional(itemDetails),
  },
  handler: async (ctx, args) => {
    assertKindConsistency(args);
    const now = Date.now();

    // minimal defaults so required nested fields are satisfied when provided
    const service =
      args.kind === "service"
        ? args.service ?? { requiresAppointment: false }
        : undefined;

    const product =
      args.kind === "product"
        ? args.product ?? { stock: 0 }
        : undefined;

    const item = args.kind === "item" ? args.item ?? {} : undefined;

    return await ctx.db.insert("catalogItems", {
      kind: args.kind,
      title: args.title,
      description: args.description,
      price: args.price,
      category: args.category,
      tags: args.tags,
      imageUrl: args.imageUrl,
      isActive: args.isActive ?? true,
      createdAt: now,
      updatedAt: now,
      service,
      product,
      item,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("catalogItems"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    price: v.optional(money),
    category: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    imageUrl: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    service: v.optional(serviceDetails),
    product: v.optional(productDetails),
    item: v.optional(itemDetails),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("Not found.");

    if (args.service && existing.kind !== "service") throw new Error("Cannot set service details on non-service.");
    if (args.product && existing.kind !== "product") throw new Error("Cannot set product details on non-product.");
    if (args.item && existing.kind !== "item") throw new Error("Cannot set item details on non-item.");

    await ctx.db.patch(args.id, {
      ...(args.title !== undefined ? { title: args.title } : {}),
      ...(args.description !== undefined ? { description: args.description } : {}),
      ...(args.price !== undefined ? { price: args.price } : {}),
      ...(args.category !== undefined ? { category: args.category } : {}),
      ...(args.tags !== undefined ? { tags: args.tags } : {}),
      ...(args.imageUrl !== undefined ? { imageUrl: args.imageUrl } : {}),
      ...(args.isActive !== undefined ? { isActive: args.isActive } : {}),
      ...(args.service !== undefined ? { service: args.service } : {}),
      ...(args.product !== undefined ? { product: args.product } : {}),
      ...(args.item !== undefined ? { item: args.item } : {}),
      updatedAt: Date.now(),
    });

    return true;
  },
});

export const deactivate = mutation({
  args: { id: v.id("catalogItems") },
  handler: async (ctx, { id }) => {
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("Not found.");
    await ctx.db.patch(id, { isActive: false, updatedAt: Date.now() });
    return true;
  },
});

export const remove = mutation({
  args: { id: v.id("catalogItems") },
  handler: async (ctx, { id }) => {
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("Not found.");
    await ctx.db.delete(id);
    return true;
  },
});

export const get = query({
  args: { id: v.id("catalogItems") },
  handler: async (ctx, { id }) => ctx.db.get(id),
});

export const list = query({
  args: {
    kind: v.optional(v.union(v.literal("service"), v.literal("product"), v.literal("item"))),
    category: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(Math.max(args.limit ?? 50, 1), 200);

    if (args.kind) {
      const rows = await ctx.db
        .query("catalogItems")
        .withIndex("by_kind", (q) => q.eq("kind", args.kind))
        .collect();
      return rows
        .filter((r) => (args.category ? r.category === args.category : true))
        .filter((r) => (args.isActive !== undefined ? r.isActive === args.isActive : true))
        .sort((a, b) => b.updatedAt - a.updatedAt)
        .slice(0, limit);
    }

    if (args.category) {
      const rows = await ctx.db
        .query("catalogItems")
        .withIndex("by_category", (q) => q.eq("category", args.category))
        .collect();
      return rows
        .filter((r) => (args.isActive !== undefined ? r.isActive === args.isActive : true))
        .sort((a, b) => b.updatedAt - a.updatedAt)
        .slice(0, limit);
    }

    if (args.isActive !== undefined) {
      const rows = await ctx.db
        .query("catalogItems")
        .withIndex("by_active", (q) => q.eq("isActive", args.isActive))
        .collect();
      return rows.sort((a, b) => b.updatedAt - a.updatedAt).slice(0, limit);
    }

    const rows = await ctx.db.query("catalogItems").collect();
    return rows.sort((a, b) => b.updatedAt - a.updatedAt).slice(0, limit);
  },
});

export const search = query({
  args: {
    q: v.string(),
    kind: v.optional(v.union(v.literal("service"), v.literal("product"), v.literal("item"))),
    category: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(Math.max(args.limit ?? 20, 1), 50);

    return await ctx.db
      .query("catalogItems")
      .withSearchIndex("search_title", (q) => {
        let qq = q.search("title", args.q);
        if (args.kind) qq = qq.eq("kind", args.kind);
        if (args.category) qq = qq.eq("category", args.category);
        if (args.isActive !== undefined) qq = qq.eq("isActive", args.isActive);
        return qq;
      })
      .take(limit);
  },
});

export const adjustStock = mutation({
  args: { id: v.id("catalogItems"), delta: v.number() },
  handler: async (ctx, { id, delta }) => {
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("Not found.");
    if (existing.kind !== "product") throw new Error("adjustStock only applies to products.");
    if (!existing.product) throw new Error("Missing product details.");

    const next = (existing.product.stock ?? 0) + delta;
    if (next < 0) throw new Error("Stock cannot go below 0.");

    await ctx.db.patch(id, {
      product: { ...existing.product, stock: next },
      updatedAt: Date.now(),
    });

    return next;
  },
});
