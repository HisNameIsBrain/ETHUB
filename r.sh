#!/usr/bin/env bash
set -euo pipefail

# ---------- helpers ----------
sed_i() {
  # Portable in-place sed: works on GNU and BSD/macOS
  if sed --version >/dev/null 2>&1; then
    sed -i "$@"
  else
    # BSD sed wants: -i '' EXPR FILES...
    local expr="${@: -1}"
    local files=("${@:1:$(($#-1))}")
    sed -i '' "$expr" "${files[@]}"
  fi
}

ensure_dir() { mkdir -p "$(dirname "$1")"; }

echo "==> 1) Create shim for missing openaiModels.ts"
ensure_dir "convex/openaiModels.ts"
if [ ! -s "convex/openaiModels.ts" ]; then
  cat > convex/openaiModels.ts <<'TS'
export const OPENAI_MODEL_OPTIONS = [
  "gpt-4o-mini",
  "gpt-4o",
  "gpt-4.1-mini",
  "gpt-4.1",
  "o3-mini",
  "o4-mini"
] as const;

export type OpenAIModel = typeof OPENAI_MODEL_OPTIONS[number];
export const DEFAULT_MODEL: OpenAIModel = "gpt-4o-mini";
TS
  echo "    wrote convex/openaiModels.ts"
else
  echo "    convex/openaiModels.ts already exists; leaving as-is"
fi

echo "==> 2) Fix fineTune.ts role typing by normalizing conversations"
if [ -f convex/fineTune.ts ]; then
  # Insert normalizeConversations() if missing
  if ! grep -q 'function normalizeConversations' convex/fineTune.ts; then
    cat >> convex/fineTune.ts <<'TS'

type ChatRole = "user" | "system" | "assistant";
type NormalizedMsg = { role: ChatRole; content: string };
type NormalizedConv = { messages: NormalizedMsg[] };

/**
 * Coerce loose role strings to the allowed union for training JSONL.
 * Unknown roles are downgraded to "user".
 */
function normalizeConversations(
  input: { messages: { role: string; content: string }[] }[]
): NormalizedConv[] {
  const allowed: ChatRole[] = ["user", "system", "assistant"];
  return input.map(c => ({
    messages: c.messages.map(m => ({
      content: m.content,
      role: (allowed.includes(m.role as ChatRole) ? m.role : "user") as ChatRole
    }))
  }));
}
TS
    echo "    appended normalizeConversations()"
  else
    echo "    normalizeConversations() already present"
  fi

  # Replace toJSONL(args.conversations) -> toJSONL(normalizeConversations(args.conversations))
  if grep -q 'toJSONL(args\.conversations)' convex/fineTune.ts; then
    sed_i 's/toJSONL(args\.conversations)/toJSONL(normalizeConversations(args.conversations))/' convex/fineTune.ts
    echo "    wrapped args.conversations with normalizeConversations()"
  else
    echo "    toJSONL(...) already normalized or pattern not found"
  fi
else
  echo "    WARN: convex/fineTune.ts not found; skipping"
fi

echo "==> 3) Fix openai.ts imports and implicit anys"
if [ -f convex/openai.ts ]; then
  # Swap alias import to relative path
  sed_i 's#@/convex/_generated/server#./_generated/server#' convex/openai.ts

  # Ensure { action, type ActionCtx } import exists
  if ! grep -q 'from "./_generated/server"' convex/openai.ts; then
    sed_i '1i\
import { action, type ActionCtx } from "./_generated/server";' convex/openai.ts
    echo "    inserted ActionCtx/action import"
  else
    # normalize to include both 'action' and 'type ActionCtx'
    if ! grep -q 'action, type ActionCtx' convex/openai.ts; then
      sed_i 's/import \{[^}]*\} from "\.\/_generated\/server";/import { action, type ActionCtx } from ".\/_generated\/server";/' convex/openai.ts
      echo "    normalized ActionCtx/action import"
    fi
  fi

  # Ensure DEFAULT_MODEL import present
  if ! grep -q 'from "./openaiModels"' convex/openai.ts; then
    sed_i '1i\
import { DEFAULT_MODEL } from "./openaiModels";' convex/openai.ts
    echo "    inserted DEFAULT_MODEL import"
  fi

  # Add ChatRole/ChatMessage types if absent
  if ! grep -q 'type ChatRole = "user" | "system" | "assistant"' convex/openai.ts; then
    sed_i '1i\
type ChatRole = "user" | "system" | "assistant";\
type ChatMessage = { role: ChatRole; content: string };' convex/openai.ts
    echo "    inserted ChatRole/ChatMessage types"
  fi

  # Type handler (ctx, { jobId })
  if grep -q 'handler: async (ctx, { jobId })' convex/openai.ts; then
    sed_i 's/handler: async (ctx, { jobId })/handler: async (ctx: ActionCtx, { jobId }: { jobId: string })/' convex/openai.ts
    echo "    typed { jobId } param"
  fi

  # Type the function taking { messages, model = DEFAULT_MODEL, temperature = 0.4, system }
  if grep -q '{ messages, model = DEFAULT_MODEL, temperature = 0.4, system }' convex/openai.ts; then
    sed_i 's/{ messages, model = DEFAULT_MODEL, temperature = 0.4, system }/{ messages, model = DEFAULT_MODEL, temperature = 0.4, system }: { messages: ChatMessage[]; model?: string; temperature?: number; system?: string }/' convex/openai.ts
    echo "    typed messages/model/temperature/system params"
  fi

  # Type (ctx: ActionCtx, { text })
  if grep -q 'handler: async (ctx: ActionCtx, { text })' convex/openai.ts; then
    sed_i 's/handler: async (ctx: ActionCtx, { text })/handler: async (ctx: ActionCtx, { text }: { text: string })/' convex/openai.ts
    echo "    typed { text } param"
  fi

  # Type (prompt, system, voice) in a handler param list (multiline-safe via perl, fallback to sed)
  if command -v perl >/dev/null 2>&1; then
    perl -0777 -pe 's/handler:\s*async\s*\(\s*ctx\s*:\s*ActionCtx\s*,\s*\{\s*prompt\s*,\s*system\s*,\s*voice\s*\}\s*\)/handler: async (ctx: ActionCtx, { prompt, system, voice }: { prompt: string; system?: string; voice?: string })/s' -i convex/openai.ts 2>/dev/null || true
  else
    sed_i 's/handler: async (ctx: ActionCtx, { prompt, system, voice })/handler: async (ctx: ActionCtx, { prompt, system, voice }: { prompt: string; system?: string; voice?: string })/' convex/openai.ts || true
  fi
else
  echo "    WARN: convex/openai.ts not found; skipping"
fi

echo "==> 4) services.ts: import action and type callbacks"
if [ -f convex/services.ts ]; then
  # Ensure import { action } from "./_generated/server";
  if ! grep -q 'from "./_generated/server"' convex/services.ts; then
    sed_i '1i\
import { action } from "./_generated/server";' convex/services.ts
    echo "    inserted action import"
  else
    if ! grep -q 'import { action } from "./_generated/server"' convex/services.ts; then
      # replace any import from _generated/server with a clean one (simple & safe)
      sed_i 's#^import .* from "\.\/_generated\/server";#import { action } from "./_generated/server";#' convex/services.ts
      echo "    normalized action import"
    fi
  fi

  # Type arrow params s => ...
  sed_i 's/\.filter(\s*s\s*=>/\.filter((s: any) =>/g' convex/services.ts
  sed_i 's/\.map(\s*s\s*=>/\.map((s: any) =>/g' convex/services.ts
else
  echo "    WARN: convex/services.ts not found; skipping"
fi

echo "==> 5) modelRoute.ts import path sanity"
if [ -f convex/modelRoute.ts ]; then
  if ! grep -q 'from "./openaiModels"' convex/modelRoute.ts; then
    sed_i 's#from ".*openaiModels"#from "./openaiModels"#' convex/modelRoute.ts || true
  fi
fi

echo "==> All patches applied."
echo "Rebuild with: pnpm build   # or npm run build / yarn build"
