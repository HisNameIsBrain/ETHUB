// convex/migrations.ts
import { mutation } from "./_generated/server";

export const backfillServices = mutation({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query("services").collect();

    let patched = 0;
    for (const r of rows) {
      const patch: Record<string, any> = {};

      // Boolean defaults
      if (r.archived === undefined) patch.archived = false;
      if (r.isPublic === undefined) patch.isPublic = true; // choose true/false as your default

      // Timestamps (prefer creationTime if missing)
      if (r.createdAt === undefined) patch.createdAt = r._creationTime ?? Date.now();
      if (r.updatedAt === undefined) patch.updatedAt = patch.createdAt ?? r.createdAt ?? Date.now();

      // Only patch if needed
      if (Object.keys(patch).length > 0) {
        await ctx.db.patch(r._id, patch);
        patched++;
      }
    }
    return { total: rows.length, patched };
  },
});
