import { mutation } from "./_generated/server";

export const stripCreatedAt = mutation({
  args: {},
  handler: async (ctx) => {
    const cur = ctx.db.query("documents");
    for await (const doc of cur) {
      await ctx.db.patch(doc._id, { createdAt: undefined });
    }
  },
});
