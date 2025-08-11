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

## Notes
- `middleware.ts` excludes Next static/image, `api/edgestore`, and webhook.
- Providers are in `app/providers.tsx` (client component) and include Clerk, Convex, EdgeStore.
- EdgeStore route mounted at `/api/edgestore`.
