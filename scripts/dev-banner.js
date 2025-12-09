const fs = require("fs");
const path = require("path");

const bannerPath = path.join(__dirname, "cli", "ethub_cli.txt");

try {
  const banner = fs.readFileSync(bannerPath, "utf8");
  // Enable ANSI colors
  console.log(banner.replace(/\\033/g, "\x1b"));
} catch (err) {
  // fail-soft
}
