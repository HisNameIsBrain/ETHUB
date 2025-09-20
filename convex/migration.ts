import { buildServiceSearch } from "./lib/search";
import { mutation } from "./_generated/server";

export const addDefaultsToServices = mutation(async (ctx) => {
  const rows = await ctx.db.query("services").collect();
  for (const r of rows) {
    const patch: Record<string, unknown> = {};

    if (typeof (r as any).isPublished !== "boolean") {
      patch.isPublished = true;
    }

    if (typeof (r as any).updatedAt !== "number") {
      patch.updatedAt = Date.now();
    }

    if (Object.keys(patch).length) {
      await ctx.db.patch(r._id, patch);
    }
  }
});
