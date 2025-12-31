// 2) convex/phoneServices.ts
import { v } from "convex/values";
import { query } from "./_generated/server";

/**
 * Returns manufacturers as "cards" (unique manufacturers that have public phone services)
 */
export const listManufacturers = query({
  args: {
    deviceType: v.optional(v.string()), // default "phone"
    onlyPublic: v.optional(v.boolean()), // default true
  },
  handler: async (ctx, args) => {
    const deviceType = args.deviceType ?? "phone";
    const onlyPublic = args.onlyPublic ?? true;

    const rows = await ctx.db.query("services").collect();

    const filtered = rows.filter((s) => {
      if (s.archived) return false;
      if (onlyPublic && !s.isPublic) return false;
      if (deviceType && s.deviceType && s.deviceType !== deviceType) return false;
      return true;
    });

    const set = new Set<string>();
    for (const s of filtered) {
      if (s.manufacturer) set.add(s.manufacturer);
    }

    return Array.from(set)
      .sort((a, b) => a.localeCompare(b))
      .map((m) => ({ manufacturer: m }));
  },
});

/**
 * Returns service groups for a manufacturer (accordion list).
 * Each group is a "service" row (screen repair, battery, etc.)
 */
export const listServiceGroupsByManufacturer = query({
  args: {
    manufacturer: v.string(),
    deviceType: v.optional(v.string()), // default "phone"
    onlyPublic: v.optional(v.boolean()), // default true
  },
  handler: async (ctx, args) => {
    const deviceType = args.deviceType ?? "phone";
    const onlyPublic = args.onlyPublic ?? true;

    // Fast index if you add by_manufacturer_public. Otherwise, this still works.
    const rows = await ctx.db
      .query("services")
      .withIndex("by_manufacturer", (q) => q.eq("manufacturer", args.manufacturer))
      .collect();

    return rows
      .filter((s) => {
        if (s.archived) return false;
        if (onlyPublic && !s.isPublic) return false;
        if (deviceType && s.deviceType && s.deviceType !== deviceType) return false;
        return true;
      })
      .sort((a, b) => {
        const ak = (a.serviceKey ?? "").toString();
        const bk = (b.serviceKey ?? "").toString();
        return ak.localeCompare(bk);
      })
      .map((s) => ({
        id: s._id,
        title: s.title ?? s.serviceKey,
        description: s.description,
        category: s.category,
        serviceKey: s.serviceKey,
        priceCents: s.priceCents,
        currency: s.currency ?? "USD",
        deliveryTime: s.deliveryTime,
      }));
  },
});

/**
 * Returns catalog entries linked to a specific serviceId.
 * These are the rows you show when the accordion expands.
 */
export const listCatalogForService = query({
  args: {
    serviceId: v.id("services"),
    activeOnly: v.optional(v.boolean()), // default true
  },
  handler: async (ctx, args) => {
    const activeOnly = args.activeOnly ?? true;

    const rows = await ctx.db
      .query("catalogItems")
      .withIndex("by_serviceId", (q) => q.eq("serviceId", args.serviceId))
      .collect();

    return rows
      .filter((c) => (activeOnly ? c.isActive : true))
      .sort((a, b) => (a.title ?? "").localeCompare(b.title ?? ""))
      .map((c) => ({
        id: c._id,
        title: c.title,
        description: c.description,
        deviceModel: c.deviceModel,
        priceCents: c.price?.amountCents,
        currency: c.price?.currency ?? "USD",
        imageUrl: c.imageUrl,
      }));
  },
});
