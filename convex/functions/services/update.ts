import { mutation } from "convex/server";
import { Id } from "../_generated/dataModel";

export const update = mutation(async ({ db }, args: { serviceId: Id; data: any }) => {
  await db.patch(args.serviceId, args.data);
  return { success: true };
});
