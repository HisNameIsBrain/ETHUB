set -euo pipefail

# 1) Remove old migrations file that used `migration`
if [ -f convex/migrations.ts ]; then
  rm convex/migrations.ts
  echo "Removed convex/migrations.ts (legacy 'migration' API)."
fi

# 2) Ensure admin backfill exists
cat > convex/admin.ts <<'TS'
import { internalMutation } from "./_generated/server";

export const backfillDocumentsIsPublished = internalMutation({
  args: {},
  handler: async (ctx) => {
    const docs = await ctx.db.query("documents").collect();
    for (const r of docs) {
      const patch: Record<string, unknown> = {};
      // @ts-expect-error legacy field may exist
      const legacyIsPublic = (r as any).isPublic;
      if (r.isPublished === undefined) {
        patch.isPublished = legacyIsPublic ?? false;
      }
      if (!("createdAt" in r) || !r.createdAt) patch.createdAt = r._creationTime;
      if (!("updatedAt" in r) || !r.updatedAt) patch.updatedAt = Date.now();
      if (Object.keys(patch).length) await ctx.db.patch(r._id, patch);
    }
  },
});
TS

# 3) Patch services update to avoid typing error
perl -0777 -pe 's/const\s*\{\s*id,\s*\.\.\.patch\s*\}\s*=\s*args;[\s\S]*?patch\.updatedAt\s*=\s*Date\.now\(\);[\s\S]*?ctx\.db\.patch\(id,\s*patch\);/const { id, ...rest } = args;\n    await ctx.db.patch(id, { ...rest, updatedAt: Date.now() });/g' -i convex/services.ts || true

echo "Done. Rebuild your app, then call backfillDocumentsIsPublished once."
