import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");

  if (!query) {
    return NextResponse.json({ error: "Missing query parameter" }, { status: 400 });
  }

  try {
    // Example: call Mobilesentrix API or mock data
    // Replace with your actual API call logic
    const res = await fetch(`https://api.mobilesentrix.com/prices?query=${encodeURIComponent(query)}`);

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch from Mobilesentrix" }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("Mobilesentrix fetch error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
