// convex/services.backfill.ts (or add at bottom of convex/services.ts temporarily)
import { mutation } from "./_generated/server";

function slugify(input: string) {
  return (input || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

async function uniqueSlug(ctx: any, baseName: string) {
  const base = slugify(baseName) || "service";
  let slug = base;
  let i = 1;
  while (true) {
    const existing = await ctx.db
      .query("services")
      .withIndex("by_slug", (q: any) => q.eq("slug", slug))
      .first();
    if (!existing) return slug;
    slug = `${base}-${i++}`;
  }
}

export const backfillServiceSlugs = mutation({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("services").collect();
    let updated = 0;

    for (const s of all) {
      // if missing/empty/invalid, set a slug
      if (!s.slug || typeof s.slug !== "string" || !s.slug.trim()) {
        const base = s.name || String(s._id);
        const slug = await uniqueSlug(ctx, base);
        await ctx.db.patch(s._id, { slug, updatedAt: Date.now() });
        updated++;
      }
    }

    return { updated };
  },
});
