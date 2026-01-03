#!/usr/bin/env node
const { execSync } = require("node:child_process");
const { readFileSync } = require("node:fs");

function main() {
  const files = execSync("git ls-files", { encoding: "utf8" })
    .split("\n")
    .filter(Boolean)
    .filter((file) => !file.startsWith("node_modules/"));

  const offenders = [];
  for (const file of files) {
    const content = readFileSync(file, "utf8");
    if (content.includes("\u0000")) continue; // likely binary
    if (/^<{7}/m.test(content) || /^={7}/m.test(content) || /^>{7}/m.test(content)) {
      offenders.push(file);
    }
  }

  if (offenders.length) {
    console.error("Merge conflict markers detected in:\n" + offenders.join("\n"));
    process.exit(1);
  }
}

main();
