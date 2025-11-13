// convex/seed.ts
"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

type IngestResult = { device: string; inserted: number; reset: boolean };

export const seedParts = action({
  args: v.object({
    device: v.string(),
    count: v.optional(v.number()),
    reset: v.optional(v.boolean()),
  }),
  handler: async (
    ctx,
    { device, count = 10, reset = false }
  ): Promise<IngestResult> => {
    const now = Date.now();
    const items: Array<{
      title: string;
      device: string;
      type: string;
      query: string;
      source: string;
      partPrice: number;
      labor: number;
      total: number;
      eta: string;
      image?: string;
      createdAt: number;
      updatedAt: number;
    }> = Array.from({ length: count }).map((_, i) => ({
      title: `${device} Part ${i + 1}`,
      device,
      type: "generic",
      query: `${device} replacement`,
      source: "seed",
      partPrice: 49.99 + i,
      labor: 30,
      total: 79.99 + i,
      eta: "2-4 days",
      createdAt: now,
      updatedAt: now,
    }));

    const res: IngestResult = await ctx.runAction(api.parts.ingestFromVendor, {
      device,
      count,
      reset,
      items,
    });

    return res;
  },
});

export const seedCommon = action({
  args: v.object({
    devices: v.array(v.string()),
    count: v.optional(v.number()),
    reset: v.optional(v.boolean()),
  }),
  handler: async (
    ctx,
    { devices, count = 6, reset = false }
  ): Promise<IngestResult[]> => {
    const results: IngestResult[] = [];
    for (const device of devices) {
      const r: IngestResult = await ctx.runAction(api.seed.seedParts, {
        device,
        count,
        reset,
      });
      results.push(r);
    }
    return results;
  },
});

export const seedParts = action({
  args: v.object({
    device: v.string(),
    count: v.optional(v.number()),
    reset: v.optional(v.boolean()),
  }),
  handler: async (ctx, { device, count = 10, reset = false }) => {
    // Supply mock items or pipe in from a vendor client later
    const now = Date.now();
    const items = Array.from({ length: count }).map((_, i) => ({
      title: `${device} Part ${i + 1}`,
      device,
      type: "generic",
      query: `${device} replacement`,
      source: "seed",
      partPrice: 49.99 + i,
      labor: 30,
      total: 79.99 + i,
      eta: "2-4 days",
      image: undefined,
      createdAt: now,
      updatedAt: now,
    }));

    const res = await ctx.runAction(api.parts.ingestFromVendor, {
      device,
      count,
      reset,
      items,
    });

    return res; // { device, inserted, reset }
  },
});

// Convenience action to quickly seed common devices
export const seedCommon = action({
  args: v.object({
    devices: v.array(v.string()),
    count: v.optional(v.number()),
    reset: v.optional(v.boolean()),
  }),
  handler: async (ctx, { devices, count = 6, reset = false }) => {
    const results = [];
    for (const device of devices) {
      const r = await ctx.runAction(api.seed.seedParts, { device, count, reset });
      results.push(r);
    }
    return results;
  },
});
