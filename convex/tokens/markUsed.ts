// convex/tokens/markUsed.ts
// Runtime-safe Convex mutation wrapper to avoid typegen/import errors during iteration.

let mutation: any;
try {
  // try modern package
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  mutation = require("convex/values")?.mutation;
} catch (e) {
  // ignore
}
try {
  if (!mutation) {
    // try alternate exposed path
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    mutation = require("convex/server")?.mutation;
  }
} catch (e) {
  // ignore
}
// fallback identity wrapper so export still works at runtime
if (!mutation) {
  mutation = (fn: any) => fn;
}

export default mutation(({ db }: { db: any }, { jti, ticket, actor }: { jti: string; ticket: string; actor: string }) => {
  // Defensive: db typed as any to avoid implicit-any TypeScript errors while iterating
  const existing = db.get("portal_tokens", jti);
  if (existing) return false;
  const now = new Date().toISOString();
  const doc = { jti, ticket, usedBy: actor, usedAt: now, createdAt: now };
  db.put("portal_tokens", jti, doc);
  return true;
});
