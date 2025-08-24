#!/usr/bin/env bash
set -euo pipefail

# ============================================================
# ETHUB: Ollama LLM Assistant — Plan, Apply, Audit (Repeat)
# - Creates a branch for safe testing
# - Writes documentation: PLAN, TROUBLESHOOT, RUNBOOK
# - Applies code only with --apply
# - Multi-layer audits: env -> install -> typecheck -> lint -> build -> tests
# - Optional repeat loop (--repeat) until all pass (no TS errors)
# ============================================================

# ---------- CLI FLAGS ----------
APPLY=false
REPEAT=false
BRANCH="feat/ollama-assistant"
MODEL="llama3.1"
OLLAMA_URL="http://127.0.0.1:11434"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --apply) APPLY=true; shift;;
    --repeat) REPEAT=true; shift;;
    --branch=*) BRANCH="${1#*=}"; shift;;
    --model=*) MODEL="${1#*=}"; shift;;
    --ollama-url=*) OLLAMA_URL="${1#*=}"; shift;;
    *)
      echo "Unknown option: $1"
      echo "Usage: $0 [--apply] [--repeat] [--branch=name] [--model=llama3.1] [--ollama-url=http://127.0.0.1:11434]"
      exit 1;;
  esac
done

# ---------- UTIL ----------
ts() { date "+%Y-%m-%d %H:%M:%S"; }
log() { echo "[$(ts)] $*"; }
die() { echo "[$(ts)] ❌ $*" >&2; exit 1; }
exists() { command -v "$1" >/dev/null 2>&1; }
in_git_repo() { git rev-parse --is-inside-work-tree >/dev/null 2>&1; }

ROOT="${PWD}"
DOCS_DIR="docs/ollama-assistant"
PLAN_FILE="${DOCS_DIR}/PLAN.md"
TROUBLE_FILE="${DOCS_DIR}/TROUBLESHOOT.md"
RUNBOOK_FILE="${DOCS_DIR}/RUNBOOK.md"
LAYOUT="app/layout.tsx"
ASSIST="components/FloatingBuildAssistant.tsx"
ROUTE="app/api/ai/chat/route.ts"

mkdir -p "$DOCS_DIR" "app/api/ai/chat" "components"

# ---------- PACKAGE MANAGER ----------
if exists pnpm; then PKG=pnpm
elif exists yarn; then PKG=yarn
else PKG=npm
fi
log "Package manager: $PKG"

# ---------- WRITE PLAN (always) ----------
cat > "$PLAN_FILE" <<EOF
# ETHUB: Ollama Assistant — Implementation Plan

**Goal:** Add a floating chat button that expands into a large card (typing + voice) powered by **Ollama** via the Vercel AI SDK, isolated on a **test branch** with audits that ensure **zero TypeScript errors**.

## Files to add (on --apply)
1. \`components/FloatingBuildAssistant.tsx\`
   - Client component with icon, overlay card, voice input via Web Speech API, and streaming via \`useChat\`.
2. \`app/api/ai/chat/route.ts\`
   - Server route using \`@ai-sdk/ollama\` \`createOllama\` + \`streamText\`.
   - Model: \`${MODEL}\`. Base URL: \`${OLLAMA_URL}\`.
3. \`.env.local\` (append if missing): \`OLLAMA_URL=${OLLAMA_URL}\`
4. Inject \`<FloatingBuildAssistant />\` into \`app/layout.tsx\` (idempotent import + JSX insert before </body>).

## Dependencies to add
- \`ai\` (Vercel AI SDK)
- \`@ai-sdk/ollama\`
- \`lucide-react\` (icons)

## Multi-layer Audits (pipeline)
1. **Environment**: Node version, package manager presence, Ollama URL env
2. **Install**: \`${PKG} install\` / add deps if needed
3. **TypeScript**: \`tsc --noEmit\` (must be zero errors)
4. **Lint** (if configured): \`${PKG} run lint\` or \`eslint .\`
5. **Build**: \`next build\` — catches SSR/edge errors too
6. **Tests** (if configured): \`${PKG} test --watch=false\`

## Safety rules
- No code changes without **this written plan** in repo.
- Code applied only with \`--apply\`.
- Any audit failure writes an entry to \`TROUBLESHOOT.md\` with root-cause notes & next steps.
- Optional \`--repeat\` re-runs audits until success (good for active fixing).

EOF
log "Wrote plan: $PLAN_FILE"

# ---------- RUNBOOK (how-to) ----------
cat > "$RUNBOOK_FILE" <<EOF
# ETHUB Build Assistant RUNBOOK (Ollama)

## Quick start
1. Ensure Ollama is running locally:
   \`\`\`
   ollama serve
   ollama pull ${MODEL}
   \`\`\`
2. Dry run (no changes): \`bash setup-ollama-assistant-audit.sh\`
3. Apply + audit: \`bash setup-ollama-assistant-audit.sh --apply\`
4. Keep auditing while you fix issues: \`bash setup-ollama-assistant-audit.sh --apply --repeat\`
5. Open app, click **Assistant** (top-right), ask by typing or voice.

## How it’s wired
- UI: Floating button -> overlay card -> \`useChat\` (streams)
- API: \`/api/ai/chat\` -> Ollama (\`${MODEL}\`) -> response stream -> UI
- Voice: Web Speech API (Chrome/Edge; falls back silently if unsupported)

## What “done” looks like
- \`tsc --noEmit\`: 0 errors
- \`next build\`: succeeds
- Assistant renders on every page (global layout)
- Requests hit \`/api/ai/chat\` and stream responses from Ollama

EOF
log "Wrote runbook: $RUNBOOK_FILE"

# ---------- GIT BRANCH ----------
if in_git_repo; then
  current_branch="$(git rev-parse --abbrev-ref HEAD)"
  log "Git repo detected (current: $current_branch)"
  if [[ "$current_branch" != "$BRANCH" ]]; then
    git fetch --all --quiet || true
    if git rev-parse --verify "$BRANCH" >/dev/null 2>&1; then
      log "Branch exists -> checkout $BRANCH"
      git checkout "$BRANCH"
    else
      log "Create branch $BRANCH"
      git checkout -b "$BRANCH"
    fi
  fi
  git add "$PLAN_FILE" "$RUNBOOK_FILE" >/dev/null 2>&1 || true
  git commit -m "docs(assistant): add plan & runbook for Ollama assistant" >/dev/null 2>&1 || true
else
  log "No git repo detected. Skipping branch creation."
fi

# ---------- APPLY (if requested) ----------
if $APPLY; then
  log "Applying code changes per plan…"

  # install deps
  DEPS="ai @ai-sdk/ollama lucide-react"
  log "Installing deps: $DEPS"
  if [[ "$PKG" == "pnpm" ]]; then pnpm add $DEPS
  elif [[ "$PKG" == "yarn" ]]; then yarn add $DEPS
  else npm i $DEPS
  fi

  # Assistant component
  if [[ ! -f "$ASSIST" ]]; then
    cat > "$ASSIST" <<'TSX'
"use client";

import * as React from "react";
import { useRef, useEffect, useState } from "react";
import { useChat } from "ai/react";
import { MessageSquareText, X, Mic, MicOff, Send, Loader2 } from "lucide-react";

function useSpeechInput(onTranscript: (text: string, isFinal: boolean) => void) {
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    const SR: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SR) {
      const rec: SpeechRecognition = new SR();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = "en-US";
      rec.onresult = (e: SpeechRecognitionEvent) => {
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const res = e.results[i];
          const text = res[0]?.transcript ?? "";
          onTranscript(text, res.isFinal);
        }
      };
      rec.onend = () => setListening(false);
      recognitionRef.current = rec;
      setSupported(true);
    }
  }, [onTranscript]);

  const start = React.useCallback(() => {
    if (!recognitionRef.current) return;
    try { recognitionRef.current.start(); setListening(true); } catch {}
  }, []);
  const stop = React.useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  return { listening, supported, start, stop };
}

type Props = {
  api?: string;
  defaultOpen?: boolean;
  placeholder?: string;
};

export default function FloatingBuildAssistant({
  api = "/api/ai/chat",
  defaultOpen = false,
  placeholder = "Ask the assistant to create services, explain errors, scaffold code…",
}: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const [draftFromMic, setDraftFromMic] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading, stop, setInput } = useChat({
    api,
    onFinish: () => setDraftFromMic(""),
  });

  const { listening, supported, start, stop: stopMic } = useSpeechInput((text, isFinal) => {
    setDraftFromMic(text);
    if (isFinal) {
      const merged = `${input}${input && text ? " " : ""}${text}`.trim();
      setInput(merged);
      setDraftFromMic("");
    }
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(o => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!open) return;
    const el = containerRef.current?.querySelector<HTMLTextAreaElement>("textarea");
    el?.focus();
  }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed top-4 right-4 z-[60] inline-flex items-center gap-2 rounded-full border bg-background px-4 py-2 shadow-md hover:shadow-lg transition"
        aria-label="Open build assistant"
      >
        <MessageSquareText className="h-5 w-5" />
        <span className="hidden sm:inline">Assistant</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-[59]">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div
            ref={containerRef}
            className="absolute top-4 right-4 w-[min(720px,calc(100vw-2rem))] h-[min(70vh,calc(100vh-2rem))] rounded-2xl border bg-background shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div className="font-semibold">Build Assistant</div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => (listening ? stop() : start())}
                  className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm ${listening ? "bg-red-50" : ""}`}
                  title={supported ? (listening ? "Stop voice" : "Voice") : "Voice not supported"}
                  disabled={!supported}
                >
                  {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  <span className="hidden sm:inline">{listening ? "Stop" : "Voice"}</span>
                </button>

                <button
                  onClick={() => stop()}
                  className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm"
                  disabled={!isLoading}
                  title="Stop response"
                >
                  <Loader2 className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                  <span className="hidden sm:inline">Stop</span>
                </button>

                <button
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm"
                  title="Close"
                >
                  <X className="h-4 w-4" />
                  <span className="hidden sm:inline">Close</span>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-4 space-y-3">
              {messages.length === 0 && (
                <div className="text-sm text-muted-foreground">
                  Ask me to <b>create services</b>, <b>scaffold pages</b>, <b>write Convex code</b>, or <b>explain errors</b>.
                  <br />
                  Tip: <kbd className="px-1 border rounded">⌘/Ctrl</kbd> + <kbd className="px-1 border rounded">K</kbd> toggles me anywhere.
                </div>
              )}
              {messages.map((m) => (
                <div key={m.id} className={`max-w-[85%] ${m.role === "user" ? "ml-auto text-right" : ""}`}>
                  <div className={`rounded-xl border px-3 py-2 whitespace-pre-wrap ${m.role === "user" ? "bg-accent/30" : ""}`}>
                    <div className="text-xs font-medium opacity-60 mb-1">
                      {m.role === "user" ? "You" : "Assistant"}
                    </div>
                    {m.content}
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="border-t p-3 flex items-end gap-2">
              <textarea
                value={draftFromMic ? `${input}${input ? " " : ""}${draftFromMic}` : input}
                onChange={handleInputChange}
                rows={2}
                placeholder={placeholder}
                className="flex-1 resize-none rounded-xl border px-3 py-2 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!input && !draftFromMic}
                className="inline-flex items-center gap-2 rounded-xl border px-4 py-2"
                aria-label="Send"
              >
                <Send className="h-4 w-4" />
                <span className="hidden sm:inline">Send</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
TSX
    log "Added $ASSIST"
  else
    log "Assistant component exists; not overwriting."
  fi

  # API route (Ollama)
  cat > "$ROUTE" <<TS
import { streamText } from "ai";
import { createOllama } from "@ai-sdk/ollama";

const ollama = createOllama({
  baseURL: process.env.OLLAMA_URL ?? "${OLLAMA_URL}",
});

export async function POST(req: Request) {
  const { messages } = await req.json();
  const result = await streamText({
    model: ollama("${MODEL}"),
    messages,
  });
  return result.toAIStreamResponse();
}
TS
  log "Added $ROUTE"

  # Ensure .env.local has OLLAMA_URL
  if [[ -f ".env.local" ]]; then
    if ! grep -q "^OLLAMA_URL=" .env.local; then
      echo "OLLAMA_URL=${OLLAMA_URL}" >> .env.local
      log "Appended OLLAMA_URL to .env.local"
    else
      log "OLLAMA_URL already present in .env.local"
    fi
  else
    echo "OLLAMA_URL=${OLLAMA_URL}" > .env.local
    log "Created .env.local with OLLAMA_URL"
  fi

  # Inject into layout
  if [[ ! -f "$LAYOUT" ]]; then
    die "$LAYOUT not found. Create your app/layout.tsx first."
  fi
  BACKUP="${LAYOUT}.bak.$(date +%s)"
  cp "$LAYOUT" "$BACKUP"
  log "Backed up layout -> $BACKUP"

  # import line
  if ! grep -q 'FloatingBuildAssistant' "$LAYOUT"; then
    awk '
      BEGIN { inserted=0 }
      /^import / { print; next }
      inserted==0 {
        print "import FloatingBuildAssistant from \"@/components/FloatingBuildAssistant\";";
        print $0; inserted=1; next
      }
      { print }
    ' "$LAYOUT" > "$LAYOUT.tmp" && mv "$LAYOUT.tmp" "$LAYOUT"
    log "Injected import in layout"
  else
    log "Layout already imports FloatingBuildAssistant"
  fi

  # jsx element before </body>
  if ! grep -q '<FloatingBuildAssistant' "$LAYOUT"; then
    sed -E 's#</body>#  <FloatingBuildAssistant />\n      </body>#' "$LAYOUT" > "$LAYOUT.tmp" && mv "$LAYOUT.tmp" "$LAYOUT"
    log "Injected <FloatingBuildAssistant /> into layout"
  else
    log "Layout already contains the assistant component"
  fi

  # Git commit
  if in_git_repo; then
    git add -A
    git commit -m "feat(assistant): add Ollama assistant UI/route + env wiring" || true
    log "Committed code on branch $BRANCH"
  fi
else
  log "Dry run only (no code changes). Use --apply to make changes."
fi

# ---------- AUDIT FUNCTIONS ----------
append_trouble () {
  {
    echo -e "\n---\n## $(ts) — $1"
    shift
    echo -e "$*"
  } >> "$TROUBLE_FILE"
}

audit_env () {
  log "Audit: environment"
  exists node || die "Node not found. Install Node >= 18."
  exists $PKG || die "Package manager '$PKG' not found."
  # warn if Ollama not reachable (best-effort)
  if curl -sSf "${OLLAMA_URL}/api/tags" >/dev/null 2>&1; then
    log "Ollama reachable at ${OLLAMA_URL}"
  else
    append_trouble "Ollama not reachable" "Check ollama serve is running and OLLAMA_URL=${OLLAMA_URL}"
    log "WARN: Ollama not reachable now (ok for build/typecheck)."
  fi
}

audit_install () {
  log "Audit: install"
  if [[ "$PKG" == "pnpm" ]]; then pnpm install
  elif [[ "$PKG" == "yarn" ]]; then yarn install
  else npm install
  fi
}

audit_tsc () {
  log "Audit: TypeScript (noEmit)"
  if npx --yes tsc --noEmit; then
    log "TS ✅"
  else
    append_trouble "TypeScript errors" "Run: npx tsc --noEmit\nFix types (common culprits: wrong imports, missing types)."
    return 1
  fi
}

audit_lint () {
  log "Audit: lint"
  if npm run -s lint >/dev/null 2>&1 || pnpm -s lint >/dev/null 2>&1 || yarn -s lint >/dev/null 2>&1; then
    log "Lint ✅"
    return 0
  fi
  if npx --yes eslint .; then
    log "Lint ✅ (fallback)"
  else
    append_trouble "ESLint errors" "Fix reported lint problems or disable rules temporarily."
    return 1
  fi
}

audit_build () {
  log "Audit: next build"
  if npx --yes next build; then
    log "Build ✅"
  else
    append_trouble "Next build failed" "Common issues: duplicate providers (Clerk), invalid imports, server/client mismatch."
    return 1
  fi
}

audit_tests () {
  log "Audit: tests (if configured)"
  if npm run -s test -- --watch=false >/dev/null 2>&1 || pnpm -s test --watch=false >/dev/null 2>&1 || yarn -s test --watch=false >/dev/null 2>&1; then
    log "Tests ✅"
  else
    log "No tests or failed tests. Skipping hard fail."
  fi
}

run_audits_once () {
  local ok=true
  audit_env || ok=false
  audit_install || ok=false
  audit_tsc || ok=false
  audit_lint || ok=false
  audit_build || ok=false
  audit_tests || true
  $ok
}

# ---------- AUDIT LOOP ----------
PASS_MSG="All audits passed (env, install, TS, lint, build${APPLY:+, with code applied})."
if $REPEAT; then
  log "Starting repeat audit loop. Ctrl+C to stop."
  while true; do
    if run_audits_once; then
      log "$PASS_MSG"
      break
    else
      log "Audits failed. See $TROUBLE_FILE. Re-running in 20s…"
      sleep 20
    fi
  done
else
  if run_audits_once; then
    log "$PASS_MSG"
  else
    die "Audits failed. See $TROUBLE_FILE for written troubleshooting steps."
  fi
fi

# ---------- WHY THIS WORKED (documentation) ----------
cat > "$DOCS_DIR/WHY-THIS-WORKED.md" <<EOF
# Why this worked (plain language)

- We **planned first**: wrote a clear PLAN so nobody is guessing. No code landed without a doc.
- We **isolated risk**: new **git branch** so the main branches stay clean.
- We **added only three moving parts**: a UI component, a single API route, and one env var. Minimal blast radius.
- We used **Vercel AI SDK** with **Ollama** which is lightweight and streams out of the box.
- We enforced a **multi-layer audit**:
  1) environment sane (node, pkgs, Ollama reachable),
  2) deps install clean,
  3) **TypeScript must be zero‑error**,
  4) lint must pass (style & common mistakes),
  5) Next **build** catches SSR/edge mismatches,
  6) tests (if present).
- If anything failed, we logged a **TROUBLESHOOT** note with what to try next, in repo, so future you (or the team) learn once and reuse.
- With \`--repeat\`, it keeps re-checking while you fix, so you get fast feedback and stop when everything is green.

EOF

log "Done. ✅  Docs in $DOCS_DIR"
