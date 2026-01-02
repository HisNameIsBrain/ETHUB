import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";

const APP_ROOT = path.resolve(process.cwd(), "app");
const MAX_BYTES = 512_000;

function safeResolve(rel: string) {
  if (path.isAbsolute(rel)) throw new Error("Absolute paths not allowed");
  const resolved = path.resolve(APP_ROOT, rel);
  if (!resolved.startsWith(APP_ROOT + path.sep) && resolved !== APP_ROOT) {
    throw new Error("Path escapes sandbox");
  }
  return resolved;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const rel = url.searchParams.get("path");
    if (!rel) throw new Error("Missing path");

    const target = safeResolve(rel);
    const st = await fs.lstat(target);
    if (st.isSymbolicLink()) throw new Error("Symlinks not allowed");
    if (!st.isFile()) throw new Error("Not a file");
    if (st.size > MAX_BYTES) throw new Error(`File too large (> ${MAX_BYTES} bytes)`);

    const content = await fs.readFile(target, "utf8");
    return NextResponse.json({ ok: true, path: rel, content });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "Error" }, { status: 400 });
  }
}
