#!/bin/bash
set -euo pipefail

FILE="convex/backfill-documents.ts"

echo "=== Writing backfill mutation to $FILE ==="
cat > "$FILE" <<'TS'
import { mutation } from "./_generated/server";

export const backfillDocumentTimestamps = mutation({
  args: {},
  handler: async (ctx) => {
    const docs = await ctx.db.query("documents").collect();
    let patched = 0;
    for (const d of docs) {
      const patch: any = {};
      if (d.createdAt === undefined) patch.createdAt = d._creationTime;
      if (d.updatedAt === undefined) patch.updatedAt = d._creationTime;
      if (Object.keys(patch).length > 0) {
        await ctx.db.patch(d._id, patch);
        patched++;
      }
    }
    console.log(`Patched ${patched} documents`);
    return { patched };
  },
});
TS

echo "=== Typechecking and regenerating Convex types ==="
npx convex codegen

echo "=== Running backfill mutation ==="
# This command path is: <file-name-without-ext>:<exported-function-name>
npx convex run backfill-documents:backfillDocumentTimestamps

echo "=== (Optional) Remove the temporary mutation file ==="
# rm "$FILE"

echo "=== Done ==="
