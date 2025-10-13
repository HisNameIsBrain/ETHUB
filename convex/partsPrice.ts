import { query } from "./_generated/server";
import { v } from "convex/values";

export const getPartPrices = query({
  args: { query: v.string() },
  handler: async (ctx, { query }) => {
    const q = query.toLowerCase().trim();
    if (!q) return { recommended: null, alternative: null };

    // Fetch all parts
    const all = await ctx.db.query("devicePrices").collect();

    // Match by brand, model, or repairType
    const matches = all.filter((p) =>
      `${p.brand} ${p.model} ${p.repairType}`.toLowerCase().includes(q)
    );

    if (matches.length === 0)
      return { recommended: null, alternative: null, matches: [] };

    // Build price suggestion object
    const recommended = {
      title: `${matches[0].brand} ${matches[0].model} ${matches[0].repairType}`,
      aftermarketPrice: matches[0].minPriceUSD,
      premiumPrice: matches[0].maxPriceUSD,
    };

    // If there’s another match, suggest as alternative
    const alternative = matches[1]
      ? {
          title: `${matches[1].brand} ${matches[1].model} ${matches[1].repairType}`,
          aftermarketPrice: matches[1].minPriceUSD,
          premiumPrice: matches[1].maxPriceUSD,
        }
      : null;

    return { recommended, alternative, matches };
  },
});
