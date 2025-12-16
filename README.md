# ETHUB Fixed Baseline

A minimal Next.js App Router project wired for **Clerk v5**, **Convex**, and **EdgeStore** with correct provider and middleware setup.

## Quickstart

1. Install deps

```bash
npm install
```

2. Set envs

- Copy `.env.example` to `.env.local` and fill:
  - `NEXT_PUBLIC_CONVEX_URL=https://<your>.convex.cloud`
  - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...`
  - `CLERK_SECRET_KEY=...`
  - `EDGE_STORE_ACCESS_KEY=...`
 - `EDGE_STORE_SECRET_KEY=...`
- Create a Clerk JWT template named **convex** with Audience `convex`.

3. Convex (dev)

```bash
npx convex dev
```

Keep it running to register functions.

4. Run app

```bash
npm run dev
```

5. Build

```bash
npm run build && npm start
```

## Go server (API-only)

A lightweight Go server is available for serving the health and OpenAPI endpoints without the Next.js runtime. To start it locally:

```bash
go run ./cmd/ethub
```

The server listens on port `8080` by default (override with `PORT`) and exposes:

- `GET /healthz` — simple health probe
- `GET /api/info` — metadata about the Go service
- `GET /api/openapi` — serves the repository `openapi.json` specification

## Terminal MCP ChatGPT agent

Chat with OpenAI from your terminal using a colorized, MCP-inspired interface:

```bash
OPENAI_API_KEY=sk-... npm run mcp:terminal
```

Set `OPENAI_MODEL` to override the default `gpt-4o-mini`. See [docs/terminal-mcp-agent.md](docs/terminal-mcp-agent.md) for details.

## Notes

- `middleware.ts` excludes Next static/image, `api/edgestore`, and webhook.
- Providers are in `app/providers.tsx` (client component) and include Clerk, Convex, EdgeStore.
- EdgeStore route mounted at `/api/edgestore`.
