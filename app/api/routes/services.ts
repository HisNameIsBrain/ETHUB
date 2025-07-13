import { query, mutation } from 'convex/server';

export const getById = query({
  args: { id: v.id("services") },
  handler: async ({ db }, { id }) => {
    return await db.query("services").filter((q) => q.eq(q.field("_id"), id)).unique();
  },
});

export const update = mutation({
  args: {
    id: v.id("services"),
    data: v.object({
      name: v.string(),
      deliveryTime: v.string(),
      price: v.number(),
    }),
  },
  handler: async ({ db }, { id, data }) => {
    await db.patch(id, data);
  },
});