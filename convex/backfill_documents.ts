import { mutation } from "./_generated/server";

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

async function uniqueSlug(ctx: any, name: string) {
  const base = slugify(name || "service");
  let slug = base;
  let i = 1;
  while (
    await ctx.db.query("services").withIndex("by_slug", (q: any) => q.eq("slug", slug)).first()
  ) {
    slug = `${base}-${i++}`;
  }
  return slug;
}

export const backfillMissingFields = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity(); // may be null in dashboard run; that's okay
    const rows = await ctx.db.query("services").collect();
    
    let patched = 0;
    
    for (const s of rows) {
      const patch: any = {};
      if (s.archived === undefined) patch.archived = false;
      if (s.isPublic === undefined) patch.isPublic = true;
      if (s.createdAt === undefined) patch.createdAt = Date.now();
      if (s.updatedAt === undefined) patch.updatedAt = Date.now();
      if (!s.slug) patch.slug = await uniqueSlug(ctx, s.name ?? "service");
      if (!s.createdBy) patch.createdBy = identity?.subject ?? "system";
      
      if (Object.keys(patch).length) {
        await ctx.db.patch(s._id, patch);
        patched++;
      }
    }
    return { patched, total: rows.length };
  },
});