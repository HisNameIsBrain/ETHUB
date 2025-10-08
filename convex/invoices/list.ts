// convex/functions/invoices/list.ts
let query: any;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  query = require("convex/values")?.query;
} catch {}
try {
  if (!query) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    query = require("convex/server")?.query;
  }
} catch {}
if (!query) {
  query = (fn: any) => fn;
}

export default query(({ db }: { db: any }) => {
  // Return all invoices ordered by updatedAt descending.
  // Use `any` for db to avoid implicit-any errors while iterating quickly.
  return db.query("invoices").order("updatedAt", "desc").collect();
});
