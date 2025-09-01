#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

function walk(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === "node_modules" || e.name.startsWith(".next")) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, acc);
    else if (p.endsWith(".tsx")) acc.push(p);
  }
  return acc;
}

function fix(f) {
  let s = fs.readFileSync(f, "utf8");
  const o = s;
  s = s.replace(/\seditable(\s*=\s*\{?\s*true\s*\}?)/g, "");
  s = s.replace(/\seditable\s*=\s*\{?\s*false\s*\}?/g, " readOnly={true}");
  if (s !== o) fs.writeFileSync(f, s);
}

walk(process.cwd()).forEach((f) => {
  try {
    fix(f);
  } catch {}
});
