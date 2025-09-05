#!/usr/bin/env node
// Converts "...${...}" → `...${...}` inside TSX files
const fs = require("fs");
const path = require("path");

const roots = ["app", "components"];
const exts = new Set([".tsx", ".ts"]);

function walk(dir, acc) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p, acc);
    else if (exts.has(path.extname(entry.name))) acc.push(p);
  }
  return acc;
}

function fixContent(s) {
  // 1) Simple cases: "…${…}…" → `…${…}…`
  s = s.replace(/"([^"\n]*\$\{[^"]*\}[^"\n]*)"/g, (m) => "`" + m.slice(1, -1) + "`");
  s = s.replace(/'([^'\n]*\$\{[^']*\}[^'\n]*)'/g, (m) => "`" + m.slice(1, -1) + "`");

  // 2) Common router/href patterns missed by naive regex (multi-line safe)
  s = s.replace(/router\.push\(\s*"(.*?)\$\{(.*?)\}"\s*as Route\)/g, "router.push(`$1\${$2}` as Route)");
  s = s.replace(/href=\s*"(.*?)\$\{(.*?)\}"/g, "href={`$1\${$2}`}");
  return s;
}

for (const root of roots) {
  if (!fs.existsSync(root)) continue;
  for (const file of walk(root, [])) {
    const src = fs.readFileSync(file, "utf8");
    const out = fixContent(src);
    if (out !== src) {
      fs.writeFileSync(file, out, "utf8");
      console.log("patched", file);
    }
  }
}
