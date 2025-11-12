import { QueryCtx, MutationCtx } from "./_generated/server";

export async function requireIdentity(ctx: QueryCtx | MutationCtx) {
  const id = await ctx.auth.getUserIdentity();
  if (!id) throw new Error("Unauthorized");
  return id;
}

export async function requireRole(ctx: QueryCtx | MutationCtx, roles: string[]) {
  const id = await requireIdentity(ctx);
  return id; // assume staff-only Convex by Clerk; extend with role table if needed
}

