import { mutation } from "./_generated/server";

export const seedDummyParts = mutation(async ({ db }) => {
  const dummyParts = [
    {
      brand: "Apple",
      model: "iPhone 15 Pro Max",
      repairType: "Screen (OLED)",
      title: "iPhone 15 Pro Max OLED Screen Replacement",
      image: "https://cdn.mobileparts.com/iphone15promax-oled.jpg",
      minPriceUSD: 199,
      maxPriceUSD: 329,
    },
    {
      brand: "Apple",
      model: "iPhone 15 Pro Max",
      repairType: "Battery",
      title: "iPhone 15 Pro Max Battery Replacement",
      image: "https://cdn.mobileparts.com/iphone15promax-battery.jpg",
      minPriceUSD: 89,
      maxPriceUSD: 149,
    },
    {
      brand: "Apple",
      model: "iPhone 15 Pro Max",
      repairType: "Rear Camera Lens",
      title: "Rear Camera Lens Assembly (Premium)",
      image: "https://cdn.mobileparts.com/iphone15promax-camera.jpg",
      minPriceUSD: 129,
      maxPriceUSD: 229,
    },
  ];

  for (const part of dummyParts) {
    await db.insert("partsPrice", {
      ...part,
      cachedAt: new Date().toISOString(),
    });
  }

  return { status: "ok", inserted: dummyParts.length };
});
