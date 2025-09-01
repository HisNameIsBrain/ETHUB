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

function fixFile(f) {
  let s = fs.readFileSync(f, "utf8");
  const o = s;
  s = s.replace(/>([^<]+)</g, (_, txt) => {
    const replaced = txt.replace(/"/g, "&quot;");
    return ">" + replaced + "<";
  });
  if (s !== o) fs.writeFileSync(f, s, "utf8");
}

walk(process.cwd()).forEach((f) => {
  try {
    fixFile(f);
  } catch {}
});
