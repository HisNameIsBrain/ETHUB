// convex/ensure-user.tsx
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const ensureUser = mutation({
  args: {
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    username: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
  },
  async handler(ctx, { name, email, imageUrl, username, phoneNumber }) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const authUserId = identity.subject; // required by your schema as `userId`
    const lowerEmail = (email ?? identity.email ?? "").toLowerCase();

    // 1) Try by userId (best signal that this auth user already has a row)
    const existing = await ctx.db
      .query("users")
      .withIndex("by_userId", q => q.eq("userId", authUserId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...(name !== undefined ? { name } : {}),
        ...(lowerEmail ? { email: lowerEmail } : {}),
        ...(username !== undefined ? { username } : {}),
        ...(phoneNumber !== undefined ? { phoneNumber } : {}),
        ...(imageUrl !== undefined
          ? { imageUrl }
          : identity.pictureUrl
          ? { imageUrl: identity.pictureUrl }
          : {}),
        ...(identity.tokenIdentifier
          ? { tokenIdentifier: identity.tokenIdentifier }
          : {}),
      });
      return existing._id;
    }

    // 2) Create new
    const newId = await ctx.db.insert("users", {
      userId: authUserId,
      name: name ?? identity.name ?? "Anonymous",
      email: lowerEmail,
      imageUrl: imageUrl ?? identity.pictureUrl ?? "",
      role: "user",
      username,
      phoneNumber,
      tokenIdentifier: identity.tokenIdentifier ?? undefined,
      createdAt: Date.now(),
    });

    return newId;
  },
});