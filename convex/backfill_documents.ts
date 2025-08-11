import { mutation } from "./_generated/server";

export const backfillDocumentTimestamps = mutation({
  args: {},
  handler: async (ctx) => {
    const docs = await ctx.db.query("documents").collect();
    let patched = 0;
    for (const d of docs) {
      const patch: any = {};
      if (d.createdAt === undefined) patch.createdAt = d._creationTime;
      if (d.updatedAt === undefined) patch.updatedAt = d._creationTime;
      if (Object.keys(patch).length > 0) {
        await ctx.db.patch(d._id, patch);
        patched++;
      }
    }
    console.log(`Patched ${patched} documents`);
    return { patched };
  },
});
