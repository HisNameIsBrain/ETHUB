#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const exts = new Set([".ts", ".tsx"]);
const ignoreDirs = new Set(["node_modules", ".next", "dist", ".turbo"]);

function walk(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ignoreDirs.has(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, acc);
    else if (exts.has(path.extname(e.name))) acc.push(p);
  }
  return acc;
}

function ensureRouteImport(src) {
  if (!/\bas Route\b/.test(src)) return src;
  if (/import\s+type\s+{[^}]*\bRoute\b[^}]*}\s+from\s+["']next["']/.test(src))
    return src;
  if (/^"use client"\s*;?/.test(src))
    return src.replace(
      /^"use client"\s*;?/,
      (m) => `${m}\nimport type { Route } from "next";`,
    );
  if (/^'use client'\s*;?/.test(src))
    return src.replace(
      /^'use client'\s*;?/,
      (m) => `${m}\nimport type { Route } from "next";`,
    );
  return `import type { Route } from "next";\n` + src;
}

function fixFile(f) {
  let s = fs.readFileSync(f, "utf8");
  const o = s;
  s = s.replace(
    /<Link(\s+[^>]*?)\s+href=\{?["'`]([^"'`]+)["'`]\}?/g,
    (m, pre, href) => {
      if (/as\s+Route/.test(m) || /\{[^}]*pathname:/.test(m)) return m;
      return `<Link${pre} href={${JSON.stringify(href)} as Route`;
    },
  );
  s = s.replace(
    /<Link(\s+[^>]*?)\s+href=\{\s*`([^`]+)`\s*\}/g,
    (m, pre, tpl) => {
      if (/as\s+Route/.test(m)) return m;
      return `<Link${pre} href={\`${tpl}\` as Route}`;
    },
  );
  s = s.replace(
    /\brouter\.(push|replace)\(\s*["'`]([^"'`]+)["'`](\s*,\s*\{[^}]*\})?\s*\)/g,
    (m, method, href, opts = "") =>
      `router.${method}(${JSON.stringify(href)} as Route${opts})`,
  );
  s = s.replace(
    /\brouter\.(push|replace)\(\s*`([^`]+)`(\s*,\s*\{[^}]*\})?\s*\)/g,
    (m, method, tpl, opts = "") =>
      `router.${method}(\`${tpl}\` as Route${opts})`,
  );
  if (s !== o) s = ensureRouteImport(s);
  if (s !== o) fs.writeFileSync(f, s, "utf8");
}

walk(process.cwd()).forEach((f) => {
  try {
    fixFile(f);
  } catch {}
});
