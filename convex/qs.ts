import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireRole } from "./authz";

export const passQA = mutation({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, { jobId }) => {
    await requireRole(ctx, ["admin","staff"]);
    const now = Date.now();
    await ctx.db.patch(jobId, { status: "ready", updatedAt: now });
    await ctx.db.insert("jobEvents", { jobId, type: "qa_passed", message: "Quality check passed", createdBy: (await ctx.auth.getUserIdentity())!.subject, createdAt: now });
  }
});
