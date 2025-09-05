// fix_tsx.js
// Pure Node: fixes HTML entities (&quot;) and specific router.push() cases in TSX.
// Creates .bak backups alongside changed files.

const fs = require('fs');
const path = require('path');

const ROOTS = ['app', 'components'];
const changed = [];

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, name.name);
    if (name.isDirectory()) walk(p, out);
    else if (name.isFile() && p.endsWith('.tsx')) out.push(p);
  }
  return out;
}

function fixContent(src) {
  let out = src;

  // 1) Replace &quot; with normal quotes
  out = out.replaceAll('&quot;', '"');

  // 2) router.push("...${...}...") -> router.push(`...${...}...`)
  // Only when a ${...} is inside the string.
  out = out.replace(/router\.push\("([^"]*\$\{[^"]+?\}[^"]*)"\)/g, (_m, inner) => {
    return `router.push(\`${inner}\`)`;
  });

  // 3) router.push("/") as Route -> router.push("/")
  out = out.replace(/router\.push\("\/"\)\s+as\s+Route/g, 'router.push("/")');

  return out;
}

function processFile(file) {
  const original = fs.readFileSync(file, 'utf8');
  const fixed = fixContent(original);
  if (fixed !== original) {
    const bak = file + '.bak';
    if (!fs.existsSync(bak)) fs.copyFileSync(file, bak);
    fs.writeFileSync(file, fixed, 'utf8');
    changed.push(file);
  }
}

function main() {
  // Guard: require clean working tree so we don’t stomp local edits
  try {
    const { execSync } = require('child_process');
    execSync('git diff-index --quiet HEAD --', { stdio: 'inherit' });
  } catch {
    console.error('❌ Working tree has uncommitted changes. Commit or stash, then re-run.');
    process.exit(1);
  }

  const tsxFiles = ROOTS.flatMap((r) => walk(path.join(process.cwd(), r)));
  if (tsxFiles.length === 0) {
    console.log('No .tsx files found under app/ or components/. Nothing to do.');
    return;
  }

  tsxFiles.forEach(processFile);

  console.log(JSON.stringify({ changed }, null, 2));
  console.log('\nBackups (.bak) were written next to changed files.');
}

main();
