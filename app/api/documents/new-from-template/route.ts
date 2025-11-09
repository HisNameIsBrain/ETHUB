// app/api/documents/new-from-template/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { fetchMutation } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

export async function POST(req: NextRequest) {
  const { userId } = auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const body = await req.json();
  const { title, templateId, parentDocument, overrides } = body ?? {};

  if (!title || !templateId) {
    return new NextResponse("Missing title or templateId", { status: 400 });
  }

  const id = await fetchMutation(api.templates.createDocumentFromTemplate, {
    title,
    templateId,
    parentDocument,
    overrides: overrides ?? {},
  });

  return NextResponse.json({ id });
}
