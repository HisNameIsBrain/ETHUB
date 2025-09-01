#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const skipDirs = new Set(["node_modules", ".next", "dist", ".turbo"]);
const skipPaths = [/\/app\/api\//, /\/pages\/api\//, /middleware\.(t|j)sx?$/];

function walk(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (skipDirs.has(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, acc);
    else if (p.endsWith(".tsx")) acc.push(p);
  }
  return acc;
}

function needsClient(s) {
  if (/^["']use client["']/.test(s)) return false;
  if (/^["']use server["']/.test(s)) return false;
  return (
    /\son[A-Z][a-zA-Z]+\s*=\s*\{/.test(s) ||
    /\bwindow\./.test(s) ||
    /\blocalStorage\b/.test(s) ||
    /\bdocument\./.test(s)
  );
}

function addUseClient(s) {
  const useClient = `"use client";\n`;
  if (/^["']use client["']/.test(s)) return s;
  return useClient + s;
}

walk(process.cwd()).forEach((f) => {
  if (skipPaths.some((rx) => rx.test(f))) return;
  try {
    let s = fs.readFileSync(f, "utf8");
    if (needsClient(s)) {
      if (/export\s+const\s+metadata\s*=/.test(s)) return;
      fs.writeFileSync(f, addUseClient(s), "utf8");
    }
  } catch {}
});
