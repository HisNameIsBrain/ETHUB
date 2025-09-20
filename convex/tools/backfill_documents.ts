import { buildServiceSearch } from "./lib/search";
// convex/tools/backfill_documents.ts
import { mutation } from "../_generated/server";

export const backfillDocumentTimestamps = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const docs = await ctx.db.query("documents").collect();
    let patched = 0;

    for (const d of docs) {
      const patch: any = {};
      // @ts-ignore tolerate missing fields on older rows
      if (d.createdAt === undefined) patch.createdAt = now;
      // @ts-ignore "
      if (d.updatedAt === undefined) patch.updatedAt = now;

      if (Object.keys(patch).length) {
        await ctx.db.patch(d._id, patch);
        patched++;
      }
    }
    return { patched, total: docs.length };
  },
});
