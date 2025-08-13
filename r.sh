#!/usr/bin/env bash
set -euo pipefail

echo "== Clean =="
rm -rf .next node_modules/.cache || true

echo "== Install =="
pnpm i || npm i

echo "== Typecheck =="
npm run typecheck || true

echo "== Lint =="
npm run lint || true

echo "== Convex dev (10s) =="
(npx convex dev & echo $! > .convex_pid) || true
sleep 10

echo "== Next dev smoke (10s) =="
(npm run dev & echo $! > .next_pid) || true
sleep 10 || true
kill $(cat .next_pid) || true
rm -f .next_pid

echo "== Build =="
npm run build

echo "== OK. Now deploy (optional) =="
echo "npx convex deploy"
