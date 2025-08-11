import { mutation } from "./_generated/server";

export const backfillDocumentTimestamps = mutation({
  args: {},
  handler: async ({ db }) => {
    let patched = 0;

    // Pull all documents; if you have a lot, consider batching/pagination
    const docs = await db.query("documents").collect();

    for (const d of docs) {
      const updates: Record<string, number> = {};
      if (d.createdAt === undefined) updates.createdAt = d._creationTime;
      if (d.updatedAt === undefined) updates.updatedAt = d._creationTime;

      if (Object.keys(updates).length > 0) {
        await db.patch(d._id, updates);
        patched++;
      }
    }

    return { patched };
  },
});