// app/api/image-search/route.ts
import { NextResponse } from "next/server";

const GOOGLE_API = "https://www.googleapis.com/customsearch/v1";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const q = url.searchParams.get("query") ?? "";
    const num = Math.min(Number(url.searchParams.get("num") ?? "4"), 10);

    if (!q) {
      return NextResponse.json({ error: "missing query" }, { status: 400 });
    }

    const key = process.env.GOOGLE_CSE_API_KEY;
    const cx = process.env.GOOGLE_CSE_CX;
    if (!key || !cx) {
      return NextResponse.json({ error: "server misconfigured: missing GOOGLE_CSE_API_KEY or GOOGLE_CSE_CX" }, { status: 500 });
    }

    const params = new URLSearchParams({
      key,
      cx,
      q,
      searchType: "image",
      num: String(num),
    });

    const res = await fetch(`${GOOGLE_API}?${params.toString()}`, {
      method: "GET",
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error("Google CSE error:", res.status, body);
      return NextResponse.json({ error: "image search failed", status: res.status, body }, { status: 502 });
    }

    const json = await res.json();
    const images = (json.items ?? []).map((it: any) => ({
      link: it.link,
      title: it.title,
      mime: it.mime,
      contextLink: it.image?.contextLink ?? null,
      thumbnail: it.image?.thumbnailLink ?? null,
    }));

    return NextResponse.json({ images });
  } catch (err) {
    console.error("image-search route error:", err);
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}
