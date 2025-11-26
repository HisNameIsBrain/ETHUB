
export async function authedFetch(
  path: string,
  options: RequestInit = {},
  opts: { retryOnce?: boolean; parseJson?: boolean } = {}
) {
  const { retryOnce = true, parseJson = false } = opts;

  const session = await auth();
  const token = session?.sessionId
    ? await fetch("/api/auth/token").then(r => r.text())
    : null;

  const res = await fetch(path, {
    ...options,
    headers: {
      ...options.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });

  if (res.status === 401 && retryOnce) {
    const newToken = await fetch("/api/auth/token").then(r => r.text());
    const retryRes = await fetch(path, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${newToken}`
      }
    });
    return parseJson ? retryRes.json() : retryRes;
  }

  return parseJson ? res.json() : res;
}
