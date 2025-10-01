import { NextResponse } from "next/server";

// TODO: point this to your real source:
const SOURCE_URL = "https://iosfiles.com/imei-services";

export async function GET() {
  try {
    const res = await fetch(SOURCE_URL, {
      headers: { "User-Agent": "ETHUB-ios-files-bot/1.0" },
      // Tune caching as needed
      next: { revalidate: 60 }, // 60s ISR for server-side fetch
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Upstream returned ${res.status}` },
        { status: 502 }
      );
    }

    const html = await res.text();

    // ------- SCRAPE LOGIC (adjust to your source’s structure) -------
    // Example pattern: rows like <tr><td>Name</td><td>Size</td><td>Updated</td><td>Link</td></tr>
    const rows = [...html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)];
    const items = rows
      .map(([, row]) => {
        const cells = [...row.matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)]
          .map((m) =>
            m[1]
              .replace(/<[^>]+>/g, "") // strip tags
              .replace(/\s+/g, " ")
              .trim()
          );

        // naive link grab (first anchor in the row)
        const linkMatch = row.match(/<a[^>]+href=["']([^"']+)["']/i);
        const href = linkMatch?.[1] ?? null;

        if (cells.length < 1) return null;
        return {
          id: href ?? crypto.randomUUID(),
          name: cells[0] ?? "Untitled",
          size: cells[1] ?? null,
          updatedAt: cells[2] ?? null,
          url: href,
        };
      })
      .filter(Boolean);

    return NextResponse.json({ source: SOURCE_URL, count: items.length, items });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
