import { NextResponse } from "next/server";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query") ?? undefined;
  const page = parseInt(searchParams.get("page") || "1", 10);
  const perPage = 20;

  // fetch up to (page * perPage) results
  const allParts = await fetchQuery(api.parts.searchFlat, {
    q: query,
    limitDocs: 100,
    limit: page * perPage,
  });

  // slice out only the results for this page
  const start = (page - 1) * perPage;
  const paginated = allParts.slice(start, start + perPage);

  return NextResponse.json({
    page,
    perPage,
    total: allParts.length,
    totalPages: Math.ceil(allParts.length / perPage),
    results: paginated,
  });
}
