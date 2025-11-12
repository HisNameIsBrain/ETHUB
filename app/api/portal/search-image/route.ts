import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");

  if (!query) return NextResponse.json({ error: "Missing query" }, { status: 400 });

  try {
    const googleRes = await fetch(
      `https://serpapi.com/search.json?engine=google_images&q=${encodeURIComponent(query)}&api_key=${process.env.SERPAPI_KEY}`
    );
    const data = await googleRes.json();
    const images = data.images_results?.map((img: any) => ({ url: img.original })) ?? [];
    return NextResponse.json(images);
  } catch (err) {
    console.error("Image API error:", err);
    return NextResponse.json({ error: "Image search failed" }, { status: 500 });
  }
}
