import { query, v } from "../../_generated/server";

export const getById = query({
  args: {
    serviceId: v.id("services"),
  },
  handler: async ({ db }, { serviceId }) => {
    return await db.get(serviceId);
  },
});