// convex/functions/invoices/create.ts
// Resilient Convex function wrapper: tries common module locations at runtime
let mutation: any;
try {
  // preferred modern package
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  mutation = require("convex/values")?.mutation;
} catch {}
try {
  if (!mutation) {
    // alternative older/other builds
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    mutation = require("convex/server")?.mutation;
  }
} catch {}
if (!mutation) {
  // fallback: identity wrapper so the function still exports something usable at runtime
  mutation = (fn: any) => fn;
}

type InvoicePayload = {
  ticketId?: string;
  name?: string | null;
  phone?: string | null;
  manufacturer?: string | null;
  description?: string | null;
  quote?: any;
  deposit?: any;
  service?: string | null;
  due?: string | null;
  warrantyAcknowledged?: boolean;
  part?: any;
  raw?: any;
  status?: string;
  createdBy?: string;
  createdAt?: string;
};

export default mutation(({ db }: { db: any }, payload: InvoicePayload) => {
  const ticketId = payload.ticketId ?? `IC-${Math.floor(Math.random() * 100000)}`;
  const now = new Date().toISOString();

  const doc = {
    ticketId,
    name: payload.name ?? null,
    phone: payload.phone ?? null,
    manufacturer: payload.manufacturer ?? null,
    description: payload.description ?? null,
    quote: payload.quote ?? null,
    deposit: payload.deposit ?? null,
    service: payload.service ?? null,
    due: payload.due ?? null,
    warrantyAcknowledged: !!payload.warrantyAcknowledged,
    part: payload.part ?? null,
    raw: payload.raw ?? null,
    status: payload.status ?? "pending",
    createdBy: payload.createdBy ?? "assistant",
    createdAt: payload.createdAt ?? now,
    updatedAt: now,
  };

  // Upsert the document keyed by ticketId
  // `db` is typed as any above to silence type errors while iterating
  return db.put("invoices", ticketId, doc);
});
