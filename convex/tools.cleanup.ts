import { mutation } from "./_generated/server";

export const cleanupUsers = mutation({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();

    let cleaned = 0;
    for (const u of users) {
      const patch: any = {};
      let needsPatch = false;

      // Remove legacy fields if present
      if ("tokenIdentifier" in (u as any)) { patch.tokenIdentifier = undefined; needsPatch = true; }
      if ("userId" in (u as any)) { patch.userId = undefined; needsPatch = true; }

      // If your current validator *requires* email, you could also normalize blanks here:
      // if (!u.email || typeof u.email !== "string" || !u.email.trim()) {
      //   patch.email = `unknown+${u._id}@local.invalid`;
      //   needsPatch = true;
      // }

      if (needsPatch) {
        patch.updatedAt = Date.now();
        await ctx.db.patch(u._id, patch);
        cleaned++;
      }
    }

    return { total: users.length, cleaned };
  },
});
