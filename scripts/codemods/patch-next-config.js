#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const files = ["next.config.js", "next.config.mjs", "next.config.ts"].map((f) =>
  path.join(process.cwd(), f),
);
for (const f of files) {
  if (!fs.existsSync(f)) continue;
  let s = fs.readFileSync(f, "utf8");
  const before = s;
  s = s.replace(/experimental\s*:\s*{[^}]*typedRoutes\s*:\s*true[^}]*},?/g, "");
  if (!/typedRoutes\s*:\s*true/.test(s)) {
    s = s.replace(
      /(module\.exports\s*=\s*nextConfig\s*;?)/,
      "typedRoutes: true,\n$1",
    );
    s = s.replace(
      /(const\s+nextConfig\s*=\s*{\s*)/,
      "$1\ntypedRoutes: true,\n",
    );
  }
  if (s !== before) fs.writeFileSync(f, s, "utf8");
}
