import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Doc } from "./_generated/dataModel";

export const trash = query({
  handler: async ({ db, auth }) => {
    const identity = await auth.getUserIdentity();
    if (!identity) return [];
    return await db
      .query("documents")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .filter((q) => q.eq(q.field("isArchived"), true))
      .collect();
  },
});