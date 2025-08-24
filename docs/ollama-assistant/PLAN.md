# ETHUB: Ollama Assistant — Implementation Plan

**Goal:** Add a floating chat button that expands into a large card (typing + voice) powered by **Ollama** via the Vercel AI SDK, isolated on a **test branch** with audits that ensure **zero TypeScript errors**.

## Files to add (on --apply)
1. `components/FloatingBuildAssistant.tsx`
   - Client component with icon, overlay card, voice input via Web Speech API, and streaming via `useChat`.
2. `app/api/ai/chat/route.ts`
   - Server route using `@ai-sdk/ollama` `createOllama` + `streamText`.
   - Model: `llama3.1`. Base URL: `http://127.0.0.1:11434`.
3. `.env.local` (append if missing): `OLLAMA_URL=http://127.0.0.1:11434`
4. Inject `<FloatingBuildAssistant />` into `app/layout.tsx` (idempotent import + JSX insert before </body>).

## Dependencies to add
- `ai` (Vercel AI SDK)
- `@ai-sdk/ollama`
- `lucide-react` (icons)

## Multi-layer Audits (pipeline)
1. **Environment**: Node version, package manager presence, Ollama URL env
2. **Install**: `npm install` / add deps if needed
3. **TypeScript**: `tsc --noEmit` (must be zero errors)
4. **Lint** (if configured): `npm run lint` or `eslint .`
5. **Build**: `next build` — catches SSR/edge errors too
6. **Tests** (if configured): `npm test --watch=false`

## Safety rules
- No code changes without **this written plan** in repo.
- Code applied only with `--apply`.
- Any audit failure writes an entry to `TROUBLESHOOT.md` with root-cause notes & next steps.
- Optional `--repeat` re-runs audits until success (good for active fixing).

