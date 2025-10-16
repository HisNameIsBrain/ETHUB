import { mutation } from "./_generated/server";

export const seedDummyParts = mutation({
  handler: async ({ db }) => {
    const dummyParts = [
      {
        city: "San Francisco",
        brand: "Apple",
        model: "iPhone 15 Pro Max",
        repairType: "Screen (OLED)",
        minPriceUSD: 199,
        maxPriceUSD: 329,
      },
      {
        city: "San Francisco",
        brand: "Apple",
        model: "iPhone 15 Pro Max",
        repairType: "Battery",
        minPriceUSD: 89,
        maxPriceUSD: 149,
      },
      {
        city: "San Francisco",
        brand: "Apple",
        model: "iPhone 15 Pro Max",
        repairType: "Rear Camera Lens",
        minPriceUSD: 129,
        maxPriceUSD: 229,
      },
    ];

    for (const part of dummyParts) {
      await db.insert("partsPrice", {
        ...part,
        createdAt: Date.now(),
        cachedAt: Date.now(), // Changed from new Date().toISOString()
      });
    }

    return { status: "ok", inserted: dummyParts.length };
  },
});
