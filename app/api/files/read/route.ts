
import fs from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

const ROOT = process.env.ETHUB_ROOT || "/root/ETHUB";

export async function POST(req: Request) {
  const { file } = await req.json();
  if (!file) return new NextResponse("Missing file", { status: 400 });

  const safePath = path.normalize(file).replace(/^(\.\.(\/|\\|$))+/, "");
  const abs = path.join(ROOT, safePath);

  const content = await fs.readFile(abs, "utf8");
  return NextResponse.json({ file: safePath, content });
}

