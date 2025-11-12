import { buildServiceSearch } from "./lib/search";
// convex/services.inventory.ts
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query("services").collect();
    return rows.map((r: any) => ({
      _id: r._id,
      name: r.name,
      description: r.description ?? "",
      price: typeof r.priceCents === "number" ? r.priceCents / 100 : 0,
      isPublic: r.isPublic ?? false,
      slug: r.slug,
      archived: r.archived ?? false,
      buttonLabel: r.button?.label ?? "",
      buttonHref: r.button?.href ?? "",
      imageUrl: r.imageUrl ?? "",
      // new inventory fields
      sku: r.sku ?? "",
      category: r.category ?? "",
      stockQty: r.stockQty ?? 0,
      minQty: r.minQty ?? 0,
      maxQty: r.maxQty ?? 0,
      tags: Array.isArray(r.tags) ? r.tags : [],
      isFeatured: r.isFeatured ?? false,
      cost: typeof r.costCents === "number" ? r.costCents / 100 : 0,
      createdBy: r.createdBy ?? "",
      updatedBy: r.updatedBy ?? "",
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));
  },
});

export const update = mutation({
  args: {
    id: v.id("services"),
    patch: v.object({
      name: v.optional(v.string()),
      description: v.optional(v.string()),
      price: v.optional(v.number()),
      isPublic: v.optional(v.boolean()),
      slug: v.optional(v.string()),
      archived: v.optional(v.boolean()),
      buttonLabel: v.optional(v.string()),
      buttonHref: v.optional(v.string()),
      imageUrl: v.optional(v.string()),
      // new inventory fields
      sku: v.optional(v.string()),
      category: v.optional(v.string()),
      stockQty: v.optional(v.number()),
      minQty: v.optional(v.number()),
      maxQty: v.optional(v.number()),
      tags: v.optional(v.array(v.string())),
      isFeatured: v.optional(v.boolean()),
      cost: v.optional(v.number()),
      createdBy: v.optional(v.string()),
      updatedBy: v.optional(v.string()),
    }),
  },
  handler: async (ctx, { id, patch }) => {
    const p: any = {};
    if (patch.name !== undefined) p.name = patch.name;
    if (patch.description !== undefined) p.description = patch.description;
    if (patch.price !== undefined) p.priceCents = Math.round(patch.price * 100);
    if (patch.isPublic !== undefined) p.isPublic = patch.isPublic;
    if (patch.slug !== undefined) p.slug = patch.slug;
    if (patch.archived !== undefined) p.archived = patch.archived;
    if (patch.buttonLabel !== undefined || patch.buttonHref !== undefined) {
      p.button = { label: patch.buttonLabel ?? "", href: patch.buttonHref ?? "" };
    }
    if (patch.imageUrl !== undefined) p.imageUrl = patch.imageUrl;

    // new inventory fields
    if (patch.sku !== undefined) p.sku = patch.sku;
    if (patch.category !== undefined) p.category = patch.category;
    if (patch.stockQty !== undefined) p.stockQty = patch.stockQty;
    if (patch.minQty !== undefined) p.minQty = patch.minQty;
    if (patch.maxQty !== undefined) p.maxQty = patch.maxQty;
    if (patch.tags !== undefined) p.tags = patch.tags;
    if (patch.isFeatured !== undefined) p.isFeatured = patch.isFeatured;
    if (patch.cost !== undefined) p.costCents = Math.round(patch.cost * 100);
    if (patch.createdBy !== undefined) p.createdBy = patch.createdBy;
    if (patch.updatedBy !== undefined) p.updatedBy = patch.updatedBy;

    p.updatedAt = Date.now();
    await ctx.db.patch(id, p);
    return true;
  },
});
