import { mutation } from "./_generated/server";

export const backfillServices = mutation(async (ctx) => {
  const rows = await ctx.db.query("services").collect();

  let order = 1;
  for (const s of rows) {
    const patch: Record<string, unknown> = {};

    if (typeof s.sortOrder !== "number") {
      patch.sortOrder = order++;
    }

    if (typeof (s as any).isPublished !== "boolean") {
      patch.isPublished = true;
    }

    if (typeof (s as any).updatedAt !== "number") {
      patch.updatedAt = Date.now();
    }

    if (Object.keys(patch).length) {
      await ctx.db.patch(s._id, patch);
    }
  }
});
