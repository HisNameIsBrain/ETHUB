import { query } from "./_generated/server";
import { v } from "convex/values";

export const getPartsByQuery = query({
  args: { query: v.string() },
  handler: async ({ db }, { query }) => {
    return await db
      .query("parts")
      .withIndex("by_name", q => q.eq("name", query))
      .collect();
  },
});
