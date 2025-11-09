import { action } from "./_generated/server";
import { v } from "convex/values";

const rawVendorV = v.object({
  name: v.optional(v.string()),
  title: v.optional(v.string()),
  device: v.optional(v.string()),
  price: v.optional(v.number()),
  partPrice: v.optional(v.number()),
  labor: v.optional(v.number()),
  tier: v.optional(v.string()),
  type: v.optional(v.string()),
  eta: v.optional(v.string()),
  installTime: v.optional(v.string()),
  image: v.optional(v.string()),
  img: v.optional(v.string()),
  source: v.optional(v.string()),
});

export const normalizeCards = action({
  args: {
    query: v.optional(v.string()),
    items: v.array(rawVendorV),
    defaultLabor: v.optional(v.number()),
  },
  handler: async (_ctx, { query, items, defaultLabor }) => {
    const now = Date.now();
    const out = items.map((it) => {
      const part = Number.isFinite(it.partPrice) ? it.partPrice! : Number(it.price ?? 0) || undefined;
      const labor = Number.isFinite(it.labor) ? it.labor! : defaultLabor;
      const total =
        typeof part === "number" && typeof labor === "number" ? part + labor : part ?? labor ?? undefined;

      return {
        query,
        title: it.title ?? it.name ?? "Part",
        device: it.device ?? undefined,
        partPrice: part,
        labor,
        total,
        type: it.type ?? it.tier ?? undefined,
        eta: it.eta ?? it.installTime ?? undefined,
        image: it.image ?? it.img ?? undefined,
        source: it.source ?? "MobileSentrix",
        createdAt: now,
        updatedAt: now,
      };
    });

    return out;
  },
});
