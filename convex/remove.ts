import { mutation, v } from "../../_generated/server";

export const remove = mutation({
  args: {
    serviceId: v.id("services"),
  },
  handler: async ({ db, auth }, { serviceId }) => {
    const user = await auth.getUserIdentity();
    if (!user || user.role !== "admin") throw new Error("Unauthorized");

    await db.delete(serviceId);

    return { success: true };
  },
});