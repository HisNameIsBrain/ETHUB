import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query");

  if (!query) {
    return NextResponse.json({ error: "Missing query" }, { status: 400 });
  }

  try {
    // Use DuckDuckGo's public image search
    const res = await fetch(
      `https://duckduckgo.com/i.js?q=${encodeURIComponent(query)}&iax=images&ia=images`,
      { headers: { "User-Agent": "Mozilla/5.0" } }
    );
    if (!res.ok) throw new Error("Image search failed");

    const data = await res.json();
    const image = data.results?.[0]?.image ?? null;

    return NextResponse.json({ image });
  } catch (err) {
    console.error("image search error", err);
    return NextResponse.json({ image: null });
  }
}
