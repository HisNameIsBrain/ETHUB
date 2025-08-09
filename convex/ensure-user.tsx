import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const ensureUser = mutation({
  args: {
    tokenIdentifier: v.string(),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    pictureUrl: v.optional(v.string()),
  },

  handler: async ({ db }, { tokenIdentifier, name, email, pictureUrl }) => {
    // Try to find the user
    const existingUser = await db
      .query("users")
      .withIndex("by_token", q => q.eq("tokenIdentifier", tokenIdentifier))
      .first();

    if (existingUser) {
      return existingUser._id;
    }

    // Create a new one
    const userId = await db.insert("users", {
      tokenIdentifier,
      name: name ?? "Anonymous",
      email: email ?? "",
      pictureUrl: pictureUrl ?? "",
      createdAt: Date.now(),
    });

    return userId;
  },
});