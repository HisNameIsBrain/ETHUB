import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const remove = mutation({
  args: {
    id: v.id("services"),
  },
  handler: async ({ db, auth }, { id }) => {
    const user = await auth.getUserIdentity();
    if (!user || user.role !== "admin") throw new Error("Unauthorized");
    
    await db.delete(id);
    return { success: true };
  },
});