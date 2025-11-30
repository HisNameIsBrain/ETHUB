// utils/portalToken.ts
export function readPortalQS() {
  if (typeof window === "undefined") return { token: "", ticket: "" };
  const qs = new URLSearchParams(window.location.search);
  return { token: qs.get("token") ?? "", ticket: qs.get("ticket") ?? "" };
}
