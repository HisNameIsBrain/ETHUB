// @ts-nocheck
// convex/manualQuotes.ts
import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

type QuoteLine = {
  title: string;
  partPrice?: number;
  labor?: number;
  qty: number;
  subtotal: number;
};

type ManualQuoteResult = {
  items: QuoteLine[];
  subtotal: number;
  tax: number;
  total: number;
  deposit: number;
  due: number;
  invoiceId: string | null;
};

const itemV = v.object({
  title: v.string(),
  partPrice: v.optional(v.number()),
  labor: v.optional(v.number()),
  qty: v.optional(v.number()),
});

export const calculate = action({
  args: {
    items: v.array(itemV),
    taxRate: v.optional(v.number()),
    deposit: v.optional(v.number()),
    service: v.optional(v.string()),
    persistInvoice: v.optional(v.boolean()),
    customer: v.optional(
      v.object({
        name: v.optional(v.string()),
        email: v.optional(v.string()),
        phone: v.optional(v.string()),
        manufacturer: v.optional(v.string()),
        description: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args): Promise<ManualQuoteResult> => {
    const items = args.items ?? [];
    const taxRate = args.taxRate ?? 0;
    const deposit = args.deposit ?? 0;

    const lines: QuoteLine[] = items.map((it) => {
      const qty = it.qty ?? 1;
      const part = it.partPrice ?? 0;
      const labor = it.labor ?? 0;
      const subtotal = (part + labor) * qty;
      return { title: it.title, partPrice: it.partPrice, labor: it.labor, qty, subtotal };
    });

    const subtotal = lines.reduce((s, l) => s + l.subtotal, 0);
    const tax = Math.max(0, subtotal * taxRate);
    const total = subtotal + tax;
    const due = Math.max(0, total - deposit);

    let invoiceId: string | null = null;

    if (args.persistInvoice) {
      const ticketId =
        (globalThis as any).crypto?.randomUUID?.() ??
        `t_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;

      const created = await ctx.runMutation(api.invoices.create, {
        ticketId,
        name: args.customer?.name ?? null,
        email: args.customer?.email ?? null,
        phone: args.customer?.phone ?? null,
        manufacturer: args.customer?.manufacturer ?? null,
        description: args.customer?.description ?? "Manual quote",
        quote: Number.isFinite(total) ? total : 0,
        deposit: String(deposit),
        service: args.service ?? "Repair",
        warrantyAcknowledged: true,
        raw: { items: lines, taxRate, deposit, computedAt: Date.now() },
        status: "pending",
      });

      // invoices.create returns { id: Id<"invoices"> }
      invoiceId = (created as { id: string }).id;
    }

    return { items: lines, subtotal, tax, total, deposit, due, invoiceId };
  },
});
