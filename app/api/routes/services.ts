// convex/api/services.ts (or wherever your routes live)

import { query, mutation } from 'convex';
import { v } from 'convex/values';

// ✅ Get a service by ID
export const getById = query({
  args: {
    id: v.id('services'),
  },
  handler: async ({ db }, { id }) => {
    return await db.get(id);
  },
});

// ✅ Update a service
export const update = mutation({
  args: {
    id: v.id('services'),
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