// app/api/templates/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { fetchMutation, fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

export async function GET() {
  const { userId } = auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const templates = await fetchQuery(api.templates.list, {});
  return NextResponse.json(templates);
}

export async function POST(req: NextRequest) {
  const { userId } = auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const body = await req.json();

  const {
    name,
    description,
    contentTemplate,
    propertySchemaId,
    defaultProperties,
    icon,
    coverImage,
  } = body ?? {};

  if (!name) {
    return new NextResponse("Missing name", { status: 400 });
  }

  const id = await fetchMutation(api.templates.create, {
    name,
    description,
    contentTemplate,
    propertySchemaId,
    defaultProperties,
    icon,
    coverImage,
  });

  return NextResponse.json({ id });
}
