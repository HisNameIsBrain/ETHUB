import { NextResponse } from "next/server";

// export const runtime = "nodejs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("query") ?? searchParams.get("q") ?? "device";
  const num = Math.max(1, Math.min(24, Number(searchParams.get("num") ?? 6)));

  const images = Array.from({ length: num }).map((_, i) => ({
    url: `https://picsum.photos/seed/${encodeURIComponent(q)}-${i}/400/240`,
    alt: `${q} ${i + 1}`,
  }));

  return NextResponse.json({ images });
}
