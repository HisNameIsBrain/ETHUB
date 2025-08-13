import { mutation } from "./_generated/server";

export const backfillServicesRequired = mutation({
  args: {},
  handler: async (ctx) => {
    const svcs = await ctx.db.query("services").collect();
    let patched = 0;
    for (const s of svcs) {
      const patch: any = {};
      if (typeof (s as any).archived !== "boolean") patch.archived = false;
      if (typeof (s as any).createdAt !== "number") patch.createdAt = Date.now();
      if (typeof (s as any).updatedAt !== "number") patch.updatedAt = Date.now();
      if (Object.keys(patch).length) { await ctx.db.patch(s._id, patch); patched++; }
    }
    return { patched };
  },
});
