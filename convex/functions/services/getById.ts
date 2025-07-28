import { query } from "convex/server";
import { Id } from "./_generated/dataModel";

export const getById = query(async ({ db }, args: { serviceId: Id }) => {
  const service = await db.get(args.serviceId);
  return service;
});
