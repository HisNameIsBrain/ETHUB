// convex/fetchPartsForQuery.ts
import { query } from "./_generated/server";
import { v } from "convex/values";

// Optional: move this to a shared utils folder if you reuse it
async function fetchFromMobileSentrix({ brand, model, repairType }: {
  brand: string;
  model: string;
  repairType: string;
}) {
  const url = `https://api.mobilesentrix.com/parts?brand=${brand}&model=${model}&repairType=${repairType}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch parts from MobileSentrix`);
  return await res.json();
}

export const fetchPartsForQuery = query({
  args: {
    brand: v.string(),
    model: v.string(),
    repairType: v.string(),
  },
  handler: async ({ db }, { brand, model, repairType }) => {
    // First, look in cached data
    const cachedParts = await db
      .query("partsPrice")
      .filter(q =>
        q.and(
          q.eq(q.field("brand"), brand),
          q.eq(q.field("model"), model),
          q.eq(q.field("repairType"), repairType)
        )
      )
      .collect();

    if (cachedParts.length > 0) {
      console.log("✅ Serving from cache");
      return cachedParts;
    }

    // Otherwise, fetch fresh data from API
    const freshParts = await fetchFromMobileSentrix({ brand, model, repairType });

    // Save to Convex for caching
    for (const part of freshParts) {
      await db.insert("partsPrice", {
        ...part,
        brand,
        model,
        repairType,
        cachedAt: Date.now(),
      });
    }

    return freshParts;
  },
});
