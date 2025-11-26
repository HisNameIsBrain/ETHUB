import { NextResponse } from "next/server";
import { fetchQuery } from "convex/nextjs";
import { api as convexApi } from "@/convex/_generated/api";
import { auth } from "@clerk/nextjs/server";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("query") ?? "";
  const pageParam = url.searchParams.get("page") ?? "1";
  const page = Math.max(parseInt(pageParam, 10) || 1, 1);
  const perPage = 20;

  if (!q.trim()) {
    return NextResponse.json({
      page,
      perPage,
      total: 0,
      totalPages: 0,
      results: [],
    });
  }

// Clerk -> Convex auth
const { getToken, userId } = await auth(); // <-- THIS is the fix
const token = await getToken({ template: "convex" });

  if (!token || !userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const allParts = await fetchQuery(
      convexApi.parts.searchFlat,
      {
        q,
        limitDocs: 100,
        limit: page * perPage,
      },
      { token }
    );

    const start = (page - 1) * perPage;
    const results = allParts.slice(start, start + perPage);

    return NextResponse.json({
      page,
      perPage,
      total: allParts.length,
      totalPages: Math.ceil(allParts.length / perPage),
      results,
    });
  } catch (err) {
    console.error("GET /api/parts failed:", err);
    return NextResponse.json(
      { error: (err as Error).message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
