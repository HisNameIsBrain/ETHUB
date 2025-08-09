import { query } from "./_generated/server";

/**
 * getUserByToken
 * Reads the current identity and fetches the user via the "by_token" index.
 * Returns the user document or null.
 */
export const getUserByToken = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity?.tokenIdentifier) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .first();

    return user ?? null;
  },
});
