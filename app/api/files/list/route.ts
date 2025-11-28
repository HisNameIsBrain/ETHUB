
import fs from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

const ROOT = process.env.ETHUB_ROOT || "/root/ETHUB";

export async function POST(req: Request) {
  const { dir = "." } = await req.json().catch(() => ({ dir: "." }));
  const safePath = path.normalize(dir).replace(/^(\.\.(\/|\\|$))+/, "");
  const abs = path.join(ROOT, safePath);

  const entries = await fs.readdir(abs, { withFileTypes: true });
  const result = await Promise.all(
    entries.map(async (e) => {
      const full = path.join(abs, e.name);
      const stat = await fs.stat(full);
      return {
        name: e.name,
        isDir: e.isDirectory(),
        size: stat.size,
        mtime: stat.mtimeMs,
      };
    })
  );

  return NextResponse.json({ dir: safePath, entries: result });
}

