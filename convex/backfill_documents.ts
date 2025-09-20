import { buildServiceSearch } from "@/lib/search";
import { mutation } from "./_generated/server";

export const backfillDocumentTimestamps = mutation({
  args: {},
  handler: async (ctx) => {
    const docs = await ctx.db.query("documents").collect();
    let patched = 0;
    for (const d of docs) {
      const patch: any = {};
      if (typeof (d as any).createdAt !== "number")
        patch.createdAt = Date.now();
      if (typeof (d as any).updatedAt !== "number")
        patch.updatedAt = Date.now();
      if (Object.keys(patch).length) {
        await ctx.db.patch(d._id, patch);
        patched++;
      }
    }
    return { patched };
  },
});
