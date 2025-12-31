import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";

const APP_ROOT = path.resolve(process.cwd(), "app");

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
    const rel = url.searchParams.get("path") ?? "";
    const target = safeResolve(rel);

    const st = await fs.lstat(target);
    if (st.isSymbolicLink()) throw new Error("Symlinks not allowed");

    const entries = await fs.readdir(target, { withFileTypes: true });

    const out = await Promise.all(
      entries.map(async (d) => {
        const full = path.join(target, d.name);
        const lst = await fs.lstat(full);
        return {
          name: d.name,
          kind: d.isDirectory() ? "dir" : d.isFile() ? "file" : "other",
          relPath: path.relative(APP_ROOT, full),
          size: d.isFile() ? lst.size : undefined,
        };
      })
    );

    out.sort((a, b) =>
      a.kind === b.kind ? a.name.localeCompare(b.name) : a.kind === "dir" ? -1 : 1
    );

    return NextResponse.json({ ok: true, path: rel, entries: out });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? "Error" },
      { status: 400 }
    );
  }
}
