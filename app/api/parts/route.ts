// app/api/parts/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Extract query parameter from URL
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("query");

    // Validate query parameter
    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: "Query parameter is required" },
        { status: 400 }
      );
    }

    // Fetch pricing data
    const pricesRes = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/portal/prices?query=${encodeURIComponent(query)}`,
      { cache: "no-store" }
    );

    if (!pricesRes.ok) {
      console.error("Prices fetch failed:", pricesRes.status);
      return NextResponse.json(
        { error: "Failed to fetch pricing data" },
        { status: 500 }
      );
    }

    const pricesJson = await pricesRes.json();
    const recommended = pricesJson.recommended ?? null;
    const alternative = pricesJson.alternative ?? null;

    // Fetch images
    const imagesRes = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/image-search?query=${encodeURIComponent(query)}&num=6`,
      { cache: "no-store" }
    );

    let images: Array<any> = [];
    if (imagesRes.ok) {
      const imagesJson = await imagesRes.json();
      images = imagesJson?.images ?? [];
    }

    // Helper function to pick best image
    function pickImageForPart(partTitle: string): string | null {
      if (!partTitle) return null;
      const titleLower = partTitle.toLowerCase();

      for (const img of images) {
        if ((img.title ?? "").toLowerCase().includes(titleLower)) {
          return img.link;
        }
        if ((img.contextLink ?? "").toLowerCase().includes(titleLower)) {
          return img.link;
        }
      }

      if (images.length > 0) {
        return images[0].thumbnail ?? images[0].link;
      }

      return null;
    }

    // Build enriched response
    const enriched = {
      recommended: recommended ? {
        ...recommended,
        image: recommended.image ?? pickImageForPart(recommended.title ?? query),
        labor: recommended.labor ?? 100,
        total: (recommended.partPrice ?? recommended.minPrice ?? 0) + 100,
      } : null,
      alternative: alternative ? {
        ...alternative,
        image: alternative.image ?? pickImageForPart(alternative.title ?? query + " part"),
        labor: alternative.labor ?? 100,
        total: (alternative.partPrice ?? alternative.maxPrice ?? 0) + 100,
      } : null,
    };

    return NextResponse.json(enriched);
  } catch (error) {
    console.error("Parts API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
