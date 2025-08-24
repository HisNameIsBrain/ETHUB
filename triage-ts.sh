#!/usr/bin/env bash
set -euo pipefail

# triage-ts.sh — TypeScript triage with summaries, filters, formats, watch mode.
# Read-only: does NOT modify code. Exit 0 when clean, 1 when TS errors present.

# ---------- defaults ----------
CTX=6
FORMAT="table"   # table | json
ONLY=""          # path/glob filter
SINCE=""         # git ref/branch/commit
WATCH=0          # seconds; 0 = run once
OUTDIR=".ts-audit"
LOG="$OUTDIR/ts-errors.log"

# ---------- args ----------
usage() {
  cat <<EOF
Usage: $0 [--ctx N] [--format table|json] [--only PATH|GLOB] [--since GIT_REF] [--watch SECONDS]

Examples:
  $0
  $0 --ctx 8 --only app/(main) --since origin/main
  $0 --format json > .ts-audit/errors.json
  $0 --watch 5

Exit codes:
  0 = no TS errors
  1 = errors found (or tsc nonzero)
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --ctx) CTX="${2:-6}"; shift 2;;
    --format) FORMAT="${2:-table}"; shift 2;;
    --only) ONLY="${2:-}"; shift 2;;
    --since) SINCE="${2:-}"; shift 2;;
    --watch) WATCH="${2:-0}"; shift 2;;
    -h|--help) usage; exit 0;;
    *) echo "Unknown arg: $1"; usage; exit 2;;
  esac
done

mkdir -p "$OUTDIR"

# ---------- helpers ----------
ts() { date "+%Y-%m-%d %H:%M:%S"; }

run_tsc() {
  # Always plain output for parsing
  npx --yes tsc --noEmit --pretty false
}

filter_to_changed_files() {
  # Reads stdin (tsc output). Keeps only lines that reference files changed since ref.
  local ref="$1"
  if [[ -z "$ref" ]]; then cat
  else
    # Build a grep pattern of changed files
    mapfile -t files < <(git diff --name-only "$ref"... -- '**/*.ts' '**/*.tsx' '**/*.js' '**/*.jsx' 2>/dev/null || true)
    if [[ "${#files[@]}" -eq 0 ]]; then cat; return; fi
    local pat
    pat="$(printf "%s|" "${files[@]}")"
    pat="${pat%|}"
    grep -E "^[[:alnum:]/._-]*(${pat//\//\\/})[:]" || true
  fi
}

filter_to_only_path() {
  # Reads stdin and keeps only lines matching ONLY glob/path (rough grep, then refined later)
  local path="$1"
  if [[ -z "$path" ]]; then cat
  else
    grep -E "^${path//\//\\/}.*:[0-9]+:[0-9]+" || true
  fi
}

parse_locations() {
  # Reads stdin (tsc plain) and emits unique "file:line:col|code|message" lines
  awk -F: '
    /^[^ ]+\.([tj]sx?|d\.ts):[0-9]+:[0-9]+/ {
      file=$1; line=$2; col=$3;
      # message is after "- error TSxxxx: ..."
      rest=$0
      code=""; msg=""
      if (match(rest, /error TS[0-9]+/)) {
        code=substr(rest, RSTART+6, RLENGTH-6)
      }
      sub(/^[^:]+:[0-9]+:[0-9]+ - error TS[0-9]+: /, "", rest)
      msg=rest
      print file ":" line ":" col "|" code "|" msg
    }
  ' | awk '!seen[$0]++'
}

summarize_by_code() {
  awk -F'|' '{cnt[$2]++} END{for (c in cnt) printf "%s %d\n", c, cnt[c]}' | sort -k2,2nr
}

summarize_by_file() {
  awk -F'[:|]' '{cnt[$1]++} END{for (f in cnt) printf "%s %d\n", f, cnt[f]}' | sort -k2,2nr
}

show_context() {
  local file="$1" line="$2" ctx="$3"
  [[ -f "$file" ]] || return 0
  local start=$((line-ctx)); [[ $start -lt 1 ]] && start=1
  local end=$((line+ctx))
  nl -ba "$file" | sed -n "${start},${end}p"
}

render_table() {
  local temp="$1"
  echo "────────────────────────────────────────────────────────"
  echo "TypeScript errors (grouped): $(wc -l <"$temp" | tr -d ' ') found"
  echo "── By code:"
  cut -d'|' -f2 "$temp" | summarize_by_code || true
  echo
  echo "── By file:"
  cut -d'|' -f1 "$temp" | awk -F: '{print $1}' | summarize_by_file || true
  echo
  echo "── Details with context (±${CTX} lines):"
  while IFS='|' read -r loc code msg; do
    file="${loc%%:*}"
    rest="${loc#*:}"; line="${rest%%:*}"
    echo
    echo "📄 $file:$line — TS$code"
    echo "   $msg"
    echo "┈ code:"
    show_context "$file" "$line" "$CTX"
  done < "$temp"
}

render_json() {
  # Emits JSON array with objects: {file,line,col,code,message,context:[...]}
  local temp="$1"
  echo "["
  local first=1
  while IFS='|' read -r loc code msg; do
    file="${loc%%:*}"
    rest="${loc#*:}"; line="${rest%%:*}"; col="${rest#*:}"; col="${col%%|*}"
    [[ $first -eq 0 ]] && echo ","
    first=0
    echo "  {"
    echo "    \"file\": \"${file}\", \"line\": ${line}, \"col\": ${col}, \"code\": \"${code}\","
    # escape JSON in message
    escmsg=$(printf '%s' "$msg" | python3 -c 'import json,sys; print(json.dumps(sys.stdin.read()))')
    echo "    \"message\": ${escmsg},"
    # context
    echo "    \"context\": ["
    # collect context lines
    if [[ -f "$file" ]]; then
      start=$((line-CTX)); [[ $start -lt 1 ]] && start=1
      end=$((line+CTX))
      cfirst=1
      while IFS= read -r l; do
        [[ $cfirst -eq 0 ]] && echo ","
        cfirst=0
        esc=$(printf '%s' "$l" | python3 -c 'import json,sys; print(json.dumps(sys.stdin.read()))')
        echo "      ${esc}"
      done < <(nl -ba "$file" | sed -n "${start},${end}p")
    fi
    echo "    ]"
    echo "  }"
  done < "$temp"
  echo "]"
}

run_once() {
  local raw filtered temp
  temp="$(mktemp)"
  # 1) run tsc (capture even if nonzero)
  raw="$(run_tsc 2>&1 || true)"

  # 2) filter by since + only
  filtered="$raw"
  [[ -n "$SINCE" ]] && filtered="$(printf '%s' "$filtered" | filter_to_changed_files "$SINCE")"
  [[ -n "$ONLY"  ]] && filtered="$(printf '%s' "$filtered" | filter_to_only_path "$ONLY")"

  # 3) keep original for logs
  echo "$filtered" > "$LOG"

  # 4) parse locations (unique)
  printf '%s\n' "$filtered" | parse_locations > "$temp"

  if [[ ! -s "$temp" ]]; then
    # clean
    if [[ "$FORMAT" == "json" ]]; then echo "[]"; else echo "✅ No TypeScript errors."; fi
    rm -f "$temp"
    return 0
  fi

  if [[ "$FORMAT" == "json" ]]; then
    render_json "$temp"
  else
    render_table "$temp"
    echo
    echo "📝 Raw log saved at $LOG"
  fi

  rm -f "$temp"
  return 1
}

# ---------- runner ----------
if [[ "$WATCH" -gt 0 ]]; then
  while true; do
    clear
    echo "⏱  $(ts)  | ctx=$CTX format=$FORMAT only='${ONLY}' since='${SINCE}'"
    if run_once; then
      echo "✔ clean"
    else
      echo "✖ errors present"
    fi
    sleep "$WATCH"
  done
else
  run_once
fi
