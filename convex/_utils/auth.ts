// convex/_utils/auth.ts
import type { MutationCtx, QueryCtx, ActionCtx } from "../_generated/server";

/** Env-based admin allowlists (comma-separated) */
const ADMIN_USER_IDS = (process.env.ADMIN_USER_IDS ?? "")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map(s => s.trim().toLowerCase())
  .filter(Boolean);

export async function requireUser(ctx: MutationCtx | QueryCtx | ActionCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Unauthorized");
  return identity;
}

function isAdminIdentity(subject?: string | null, email?: string | null) {
  const byId = !!subject && ADMIN_USER_IDS.includes(subject);
  const byEmail = !!email && ADMIN_EMAILS.includes(email.toLowerCase());
  return byId || byEmail;
}

export async function requireAdmin(ctx: MutationCtx | QueryCtx | ActionCtx) {
  const identity = await requireUser(ctx);
  if (!isAdminIdentity(identity.subject, identity.email ?? null)) {
    // uncomment while wiring things up:
    // console.log("[requireAdmin] Forbidden", { subject: identity.subject, email: identity.email, ADMIN_USER_IDS, ADMIN_EMAILS });
    throw new Error("Forbidden");
  }
  return identity;
}

export async function isAdmin(ctx: MutationCtx | QueryCtx | ActionCtx) {
  try {
    await requireAdmin(ctx);
    return true;
  } catch {
    return false;
  }
}
