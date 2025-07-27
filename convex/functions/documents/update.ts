import { mutation } from "convex/server";
import { Id } from "../_generated/dataModel";

export const update = mutation(async ({ db }, args: { documentId: Id; data: any }) => {
  await db.patch(args.documentId, args.data);
  return { success: true };
});
