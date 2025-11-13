"use server";

export async function authedFetch(endpoint: string, options: RequestInit = {}) {
  const res = await fetch(endpoint, {
    ...options,
    headers: {
      ...(options.headers || {}),
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}
