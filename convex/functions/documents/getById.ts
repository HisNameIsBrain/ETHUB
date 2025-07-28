import { query } from "convex/server";
import { Id } from "../_generated/dataModel";

export const getById = query(async ({ db }, args: { documentId: Id }) => {
  const document = await db.get(args.documentId);
  return document;
});
