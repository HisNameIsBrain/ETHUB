import { NextResponse } from "next/server";
import path from "path";
import { spawn } from "child_process";

const APP_ROOT = path.resolve(process.cwd(), "app");

const ALLOW = new Set([
  "ls",
  "pwd",
  "whoami",
  "node",
  "npm",
  "pnpm",
  "yarn",
  "git",
  "cat",
  "mkdir",
  "mv",
  "cp",
  "echo",
  "sed",
  "grep",
  "find",
]);

const MAX_OUT = 200_000;
const TIMEOUT_MS = 12_000;

function tokenize(input: string) {
  const bad = /[|&;><`$\\\\]/;
  if (bad.test(input)) throw new Error("Unsupported shell characters");
  const parts = input.trim().split(/\\s+/).filter(Boolean);
  if (parts.length === 0) throw new Error("Empty command");
  return parts;
}

export async function POST(req: Request) {
  try {
    const { cmd } = await req.json();
    const parts = tokenize(String(cmd ?? ""));
    const bin = parts[0];

    if (!ALLOW.has(bin)) throw new Error(\`Command not allowed: \${bin}\`);

    const child = spawn(bin, parts.slice(1), {
      cwd: APP_ROOT,
      shell: false,
      windowsHide: true,
      env: {
        ...process.env,
        HOME: APP_ROOT,
      },
    });

    let out = "";
    let err = "";

    const killTimer = setTimeout(() => child.kill("SIGKILL"), TIMEOUT_MS);

    child.stdout.on("data", (d) => {
      out += d.toString("utf8");
      if (out.length > MAX_OUT) child.kill("SIGKILL");
    });

    child.stderr.on("data", (d) => {
      err += d.toString("utf8");
      if (err.length > MAX_OUT) child.kill("SIGKILL");
    });

    const code: number = await new Promise((resolve, reject) => {
      child.on("error", reject);
      child.on("close", resolve);
    });

    clearTimeout(killTimer);

    return NextResponse.json({ ok: true, code, stdout: out, stderr: err });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? "Error" },
      { status: 400 }
    );
  }
}
