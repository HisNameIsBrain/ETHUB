// convex/parts.ts
import { v } from "convex/values";
import { action } from "./_generated/server";

/**
 * Fetches parts and pricing for a given search query
 * Returns recommended (premium) and alternative (economical) options
 */
export const fetchPartsForQuery = action({
  args: {
    // Validate that query is a required string
    query: v.string(),
  },
  handler: async (ctx, args) => {
    const { query } = args;

    // Return null if query is empty or too short
    if (!query || query.trim().length === 0) {
      return null;
    }

    try {
      // Fetch pricing data from MobileSentrix API
      const pricesRes = await fetch(
        `${process.env.NEXT_PUBLIC_SITE_URL}/api/portal/prices?query=${encodeURIComponent(query)}`,
        { 
          cache: "no-store",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!pricesRes.ok) {
        console.error("Prices fetch failed:", pricesRes.status, pricesRes.statusText);
        return null;
      }

      const pricesJson = await pricesRes.json();
      const recommended = pricesJson.recommended ?? null;
      const alternative = pricesJson.alternative ?? null;

      // Fetch product images from Google Custom Search
      const imagesRes = await fetch(
        `${process.env.NEXT_PUBLIC_SITE_URL}/api/image-search?query=${encodeURIComponent(query)}&num=6`,
        { 
          cache: "no-store",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      let images: Array<any> = [];
      if (imagesRes.ok) {
        const imagesJson = await imagesRes.json();
        images = imagesJson?.images ?? [];
      }

      /**
       * Pick the most relevant image for a part based on title matching
       * Falls back to first available image if no match found
       */
      function pickImageForPart(partTitle: string): string | null {
        if (!partTitle) return null;

        const titleLower = partTitle.toLowerCase();

        // Try to find exact title match in image metadata
        for (const img of images) {
          if ((img.title ?? "").toLowerCase().includes(titleLower)) {
            return img.link;
          }
          if ((img.contextLink ?? "").toLowerCase().includes(titleLower)) {
            return img.link;
          }
        }

        // Fallback to first image thumbnail or link
        if (images.length > 0) {
          return images[0].thumbnail ?? images[0].link;
        }

        return null;
      }

      // Enrich parts with matched images
      const enriched: {
        recommended: any | null;
        alternative: any | null;
      } = {
        recommended: null,
        alternative: null,
      };

      // Add image to recommended part
      if (recommended) {
        enriched.recommended = {
          ...recommended,
          image: recommended.image ?? pickImageForPart(recommended.title ?? query),
          // Add labor cost (default $100)
          labor: recommended.labor ?? 100,
          // Calculate total price
          total: (recommended.partPrice ?? recommended.minPrice ?? 0) + (recommended.labor ?? 100),
        };
      }

      // Add image to alternative part
      if (alternative) {
        enriched.alternative = {
          ...alternative,
          image: alternative.image ?? pickImageForPart(alternative.title ?? query + " part"),
          // Add labor cost (default $100)
          labor: alternative.labor ?? 100,
          // Calculate total price
          total: (alternative.partPrice ?? alternative.maxPrice ?? 0) + (alternative.labor ?? 100),
        };
      }

      return enriched;
    } catch (err) {
      console.error("fetchPartsForQuery error:", err);
      return null;
    }
  },
});
