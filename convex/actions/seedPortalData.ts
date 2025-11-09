// convex/actions/seedPortalData.ts
"use node";

import { action } from "../_generated/server";
import { api } from "../_generated/api";

type SeedResult = {
  ok: boolean;
  device: string;
  insertedInventory: number;
  insertedParts: number;
};

export const seedPortalData = action({
  args: {},
  handler: async (ctx): Promise<SeedResult> => {
    // @ts-expect-error FunctionReference cast
    const res = await ctx.runAction(api.actions.ingestFromVendor, {
      device: "iPhone 12",
      count: 6,
      reset: true,
    });

    return {
      ok: true,
      device: res.device,
      insertedInventory: res.insertedInventory,
      insertedParts: res.insertedParts,
    };
  },
});
