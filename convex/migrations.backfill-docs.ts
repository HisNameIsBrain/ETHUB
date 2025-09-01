// convex/migrations.backfill-docs.ts
import { mutation, QueryCtx } from "./_generated/server";

async function* paginateAll<T>(
  ctx: QueryCtx,
  table: string,
  pageSize = 200,
): AsyncGenerator<T[], void, unknown> {
  let cursor: string | null = null;
  while (true) {
    // @ts-ignore - Convex types allow this at runtime
    const page = await ctx.db
      .query(table)
      .paginate({ cursor, numItems: pageSize });
    yield page.page as T[];
    if (!page.isDone) cursor = page.continueCursor!;
    else break;
  }
}

export const backfillDocumentTimestamps = mutation({
  args: {},
  handler: async (ctx) => {
    let processed = 0;
    for await (const batch of paginateAll<any>(ctx, "documents", 200)) {
      for (const d of batch) {
        const needsCreated = typeof d.createdAt !== "number";
        const needsUpdated = typeof d.updatedAt !== "number";
        if (needsCreated || needsUpdated) {
          const now = Date.now();
          await ctx.db.patch(d._id, {
            createdAt: needsCreated ? (d.updatedAt ?? now) : d.createdAt,
            updatedAt: needsUpdated ? (d.createdAt ?? now) : d.updatedAt,
          });
          processed++;
        }
      }
    }
    return { processed };
  },
});
