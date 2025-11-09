// app/api/import-notion/route.ts
import { NextRequest, NextResponse } from "next/server";
import JSZip from "jszip";
import { auth } from "@clerk/nextjs/server";
import { fetchMutation } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const { userId } = auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return new NextResponse("Missing file", { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(arrayBuffer);

  const docs: { path: string; title: string; content: string }[] = [];

  const entries = Object.values(zip.files);
  for (const entry of entries) {
    if (entry.dir) continue;
    if (!entry.name.toLowerCase().endsWith(".md")) continue;

    const content = await entry.async("string");
    const cleanPath = entry.name.replace(/\.md$/i, "");
    const fileName = cleanPath.split("/").pop() || "Untitled";
    const title = fileName;

    docs.push({
      path: cleanPath,
      title,
      content,
    });
  }

  if (!docs.length) {
    return new NextResponse("No markdown files found in ZIP", { status: 400 });
  }

  const result = await fetchMutation(
    api.documentsImport.bulkImportFromNotion,
    { docs }
  );

  return NextResponse.json(result);
}
