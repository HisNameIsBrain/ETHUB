// components/PortalSchemaPanels.tsx
"use client";

import React, { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type InvItem = {
  _id: string;
  name: string;
  device?: string;
  category?: string;
  metadata?: { notes?: string; partNumber?: string; source?: string; vendorSku?: string };
  condition?: string;
  cost?: number;
  price?: number;
  currency?: string;
  sku?: string;
  vendor?: string;
  stock?: number;
  createdAt: number;
  updatedAt: number;
};

type CatalogPart = {
  _id?: string;
  query?: string;
  title: string;
  device?: string;
  partPrice?: number;
  labor?: number;
  total?: number;
  type?: string;
  eta?: string;
  image?: string;
  source?: string;
  createdAt?: number;
  updatedAt: number;
};

type IntakeStatus = "draft" | "submitted" | "cancelled";
type InvoiceStatus = "pending" | "processing" | "completed" | "canceled";

const INTAKE_STATUSES: IntakeStatus[] = ["draft", "submitted", "cancelled"];
const INVOICE_STATUSES: InvoiceStatus[] = ["pending", "processing", "completed", "canceled"];

export function InventoryPanel() {
  const items = useQuery(api.inventoryParts.listAll, {}) ?? [];
  return (
    <Card className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-medium">Inventory</h2>
        <div className="text-xs text-muted-foreground">{items.length} items</div>
      </div>
      <div className="overflow-x-auto rounded border">
        <table className="min-w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="p-2">Name</th>
              <th className="p-2">Device</th>
              <th className="p-2">Category</th>
              <th className="p-2">Condition</th>
              <th className="p-2">SKU</th>
              <th className="p-2">Vendor</th>
              <th className="p-2 text-right">Stock</th>
              <th className="p-2 text-right">Price</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it: InvItem) => (
              <tr key={it._id} className="border-t">
                <td className="p-2">{it.name}</td>
                <td className="p-2">{it.device ?? "-"}</td>
                <td className="p-2">{it.category ?? "-"}</td>
                <td className="p-2">{it.condition ?? "-"}</td>
                <td className="p-2">{it.sku ?? "-"}</td>
                <td className="p-2">{it.vendor ?? "-"}</td>
                <td className="p-2 text-right">{it.stock ?? 0}</td>
                <td className="p-2 text-right">
                  {formatMoney(it.price, it.currency)}
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td className="p-3 text-sm text-muted-foreground" colSpan={8}>
                  No inventory yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export function PartsCatalogPanel({ query }: { query?: string }) {
  const docs =
    useQuery(api.parts.recent, {}) ?? []; // each doc may contain .parts[]
  const flatParts: CatalogPart[] = useMemo(() => {
    const acc: CatalogPart[] = [];
    for (const d of docs) {
      const arr = (d?.parts ?? []) as CatalogPart[];
      for (const p of arr) {
        if (!query || matches(p, query)) acc.push(p);
      }
    }
    return acc;
  }, [docs, query]);

  return (
    <Card className="p-4">
      <h2 className="mb-3 text-lg font-medium">Parts</h2>
      {flatParts.length === 0 ? (
        <div className="text-sm text-muted-foreground">No parts found.</div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {flatParts.map((p, i) => {
            const total =
              typeof p.total === "number"
                ? p.total
                : Number(p.partPrice || 0) + Number(p.labor || 0);
            return (
              <div key={p._id ?? `${p.title}-${i}`} className="rounded border p-3">
                {p.image ? (
                  <img className="h-24 w-full rounded object-cover" src={p.image} alt={p.title} />
                ) : (
                  <div className="h-24 w-full rounded bg-muted" />
                )}
                <div className="mt-2 text-sm font-medium">{p.title}</div>
                <div className="text-xs text-muted-foreground">
                  {p.device ?? "—"} {p.type ? `• ${p.type}` : ""}
                  {p.eta ? ` • ETA ${p.eta}` : ""}
                </div>
                <div className="mt-2 text-sm">
                  Part: {formatMoney(p.partPrice)} • Labor: {formatMoney(p.labor)}
                </div>
                <div className="font-semibold">{formatMoney(total)}</div>
                <div className="mt-2 flex gap-2">
                  <Button size="sm">Approve</Button>
                  {p.source && (
                    <Button size="sm" variant="outline" asChild>
                      <a href={p.source} target="_blank" rel="noreferrer">
                        Source
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

export function IntakeAndInvoicesPanel() {
  const [intakeStatus, setIntakeStatus] = useState<IntakeStatus>("submitted");
  const [invoiceStatuses, setInvoiceStatuses] = useState<InvoiceStatus[]>([
    "pending",
    "processing",
    "completed",
    "canceled",
  ]);

  const drafts =
    useQuery(api.intakeDrafts.listByStatus, { status: intakeStatus }) ?? [];
  const invoices =
    useQuery(api.invoices.getInvoicesByStatuses, { statuses: invoiceStatuses }) ??
    [];

  return (
    <Card className="p-4">
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-base font-semibold">Intake</h3>
            <div className="flex gap-2">
              {INTAKE_STATUSES.map((s) => (
                <Button
                  key={s}
                  size="sm"
                  variant={s === intakeStatus ? "default" : "outline"}
                  onClick={() => setIntakeStatus(s)}
                >
                  {s}
                </Button>
              ))}
            </div>
          </div>
          <div className="rounded border">
            {drafts.length === 0 ? (
              <div className="p-3 text-sm text-muted-foreground">No intake records.</div>
            ) : (
              <ul className="divide-y">
                {drafts.map((d: any) => (
                  <li key={d._id} className="p-3">
                    <div className="font-medium">{d.customerName}</div>
                    <div className="text-xs text-muted-foreground">
                      {d.deviceModel} • {d.issueDescription}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-base font-semibold">Invoices</h3>
            <div className="flex flex-wrap gap-2">
              {INVOICE_STATUSES.map((s) => {
                const active = invoiceStatuses.includes(s);
                return (
                  <Button
                    key={s}
                    size="sm"
                    variant={active ? "default" : "outline"}
                    onClick={() =>
                      setInvoiceStatuses((prev) =>
                        active ? prev.filter((x) => x !== s) : [...prev, s]
                      )
                    }
                  >
                    {s}
                  </Button>
                );
              })}
            </div>
          </div>
          <div className="rounded border">
            {invoices.length === 0 ? (
              <div className="p-3 text-sm text-muted-foreground">No invoices.</div>
            ) : (
              <ul className="divide-y">
                {invoices.map((inv: any) => (
                  <li key={inv._id} className="flex items-center justify-between p-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">
                        {inv.description ?? "(no description)"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {inv.name || inv.email || "No customer"} • {inv.service}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatMoney(inv.quote)}</div>
                      <div className="text-xs capitalize text-muted-foreground">{inv.status}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

function matches(p: CatalogPart, q: string) {
  const s = `${p.title} ${p.device ?? ""} ${p.type ?? ""}`.toLowerCase();
  return s.includes(q.toLowerCase());
}

function formatMoney(n?: number | string, currency = "USD") {
  const v = typeof n === "number" ? n : Number(n ?? 0);
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(v);
  } catch {
    return `$${v.toFixed(2)}`;
  }
}
