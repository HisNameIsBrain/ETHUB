// convex/admin.ts
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const backfillDocTimestamps = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const docs = await ctx.db.query("documents").collect();

    let updated = 0;
    for (const d of docs) {
      const needsCreated = d.createdAt === undefined;
      const needsUpdated = d.updatedAt === undefined;
      if (needsCreated || needsUpdated) {
        await ctx.db.patch(d._id, {
          // use Convex system creation time if available
          createdAt: needsCreated ? (d._creationTime ?? now) : d.createdAt,
          updatedAt: needsUpdated ? (d.updatedAt ?? d._creationTime ?? now) : d.updatedAt,
        });
        updated++;
      }
    }
    return { updated };
  },
});
