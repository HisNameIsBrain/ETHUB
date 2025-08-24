# ETHUB Build Assistant RUNBOOK (Ollama)

## Quick start
1. Ensure Ollama is running locally:
   ```
   ollama serve
   ollama pull llama3.1
   ```
2. Dry run (no changes): `bash setup-ollama-assistant-audit.sh`
3. Apply + audit: `bash setup-ollama-assistant-audit.sh --apply`
4. Keep auditing while you fix issues: `bash setup-ollama-assistant-audit.sh --apply --repeat`
5. Open app, click **Assistant** (top-right), ask by typing or voice.

## How it’s wired
- UI: Floating button -> overlay card -> `useChat` (streams)
- API: `/api/ai/chat` -> Ollama (`llama3.1`) -> response stream -> UI
- Voice: Web Speech API (Chrome/Edge; falls back silently if unsupported)

## What “done” looks like
- `tsc --noEmit`: 0 errors
- `next build`: succeeds
- Assistant renders on every page (global layout)
- Requests hit `/api/ai/chat` and stream responses from Ollama

