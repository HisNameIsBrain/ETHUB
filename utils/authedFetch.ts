// utils/authedFetch.ts
// HMR-safe Clerk token fetcher + authenticated fetch helper

export type AuthedFetchOpts = {
  retryOnce?: boolean;   // retry once on 401 with a fresh token
  parseJson?: boolean;   // if true, return parsed JSON (throws on non-2xx)
};

type TokenState = { token: string | null; ts: number };
const TOKEN_KEY = "__ethub_token_state__";
const TOKEN_TTL_MS = 4 * 60 * 1000; // ~4 minutes

function getTokenState(): TokenState {
  const g = globalThis as any;
  if (!g[TOKEN_KEY]) g[TOKEN_KEY] = { token: null, ts: 0 } as TokenState;
  return g[TOKEN_KEY] as TokenState;
}

async function fetchClerkJwt(): Promise<string | null> {
  try {
    // Your API route should return: { token: string }
    const res = await fetch("/api/auth/token", {
      method: "GET",
      cache: "no-store",
      credentials: "include",
      headers: { "Accept": "application/json" },
    });
    if (!res.ok) return null;
    const data = await res.json().catch(() => null);
    return data?.token ?? null;
  } catch {
    return null;
  }
}

async function ensureToken(force = false): Promise<string | null> {
  const state = getTokenState();
  const now = Date.now();
  if (!force && state.token && now - state.ts < TOKEN_TTL_MS) {
    return state.token;
  }
  const fresh = await fetchClerkJwt();
  if (fresh) {
    state.token = fresh;
    state.ts = now;
  }
  return state.token;
}

/**
 * authedFetch
 * Adds a Bearer token from Clerk (via /api/auth/token) and retries once on 401.
 */
export async function authedFetch(
  url: string,
  init: RequestInit = {},
  opts: AuthedFetchOpts = {}
): Promise<Response | any> {
  const { retryOnce = true, parseJson = false } = opts;

  const attach = (t: string | null): RequestInit => ({
    ...init,
    headers: {
      ...(init.headers || {}),
      "Content-Type": "application/json",
      ...(t ? { Authorization: `Bearer ${t}` } : {}),
    },
    credentials: "include",
    cache: "no-store",
  });

  // initial token (may be cached)
  let token = await ensureToken(false);
  let res = await fetch(url, attach(token));

  if (retryOnce && res.status === 401) {
    // refresh token and retry once
    token = await ensureToken(true);
    res = await fetch(url, attach(token));
  }

  if (!parseJson) return res;

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    // Surface a structured error when parseJson=true
    throw new Error(text || `HTTP ${res.status}`);
  }

  return res.json();
}
