import { query } from "./_generated/server";
import { v } from "convex/values";

export const getById = query({
  args: {
    id: v.id("services"),
  },
  handler: async ({ db }, args: { id: string }) => {
    return await db.get(args.id);
  },
});