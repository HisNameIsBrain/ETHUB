import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// 🚀 Add a member to an org
export const addMember = mutation({
  args: {
    orgId: v.string(),
    userId: v.string(),
    role: v.union(
      v.literal("owner"),
      v.literal("admin"),
      v.literal("member")
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity || identity.orgId !== args.orgId) {
      throw new Error("Unauthorized");
    }

    // Optional: allow only org owner to add members
    const isSelfOwner = await ctx.db
      .query("organizationMemberships")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();

    const currentUserRole = isSelfOwner.find(m => m.orgId === args.orgId)?.role;
    if (currentUserRole !== "owner") {
      throw new Error("Only owners can add members.");
    }

    return await ctx.db.insert("organizationMemberships", args);
  },
});

// 🔍 Get all users in an organization
export const getMembersByOrg = query({
  args: { orgId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("organizationMemberships")
      .withIndex("by_org", (q) => q.eq("orgId", args.orgId))
      .collect();
  },
});

// 🔍 Get all orgs a user belongs to
export const getOrgsByUser = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("organizationMemberships")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});