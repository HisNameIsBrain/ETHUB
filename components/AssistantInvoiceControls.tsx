"use client";

import React from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card } from "@/components/ui/card";

/**
 * Display invoices having any of the following statuses:
 * pending, new, diagnosing, troubleshooting, completed, failed
 *
 * Uses your existing Convex invoice functions (listInvoices, getInvoice, etc).
 */

const DISPLAY_STATUSES = ["pending", "new", "diagnosing", "troubleshooting", "completed", "failed"];

export default function AssistantInvoiceControls() {
  // fetch all invoices (server function exists in your repo)
  const invoices = useQuery(api.invoices.listInvoices, {});

  const filtered = React.useMemo(() => {
    if (!invoices) return undefined;
    return invoices.filter((inv: any) => DISPLAY_STATUSES.includes((inv.status ?? "").toLowerCase()));
  }, [invoices]);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Invoices</h2>

      {filtered === undefined ? (
        <div className="text-sm text-muted-foreground">Loading invoices...</div>
      ) : filtered.length === 0 ? (
        <div className="text-sm text-muted-foreground">No invoices matching selected statuses.</div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((inv: any) => (
            <Card key={inv._id} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{inv.description ?? "(no description)"}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {inv.name ? `${inv.name} • ` : ""}
                    {inv.email ?? inv.phone ?? ""}
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">Status: <span className="font-medium">{inv.status}</span></div>
                </div>

                <div className="text-right">
                  <div className="font-semibold">${typeof inv.quote === "number" ? inv.quote.toFixed(2) : "TBA"}</div>
                  <div className="text-xs text-muted-foreground mt-1">{new Date(inv.createdAt ?? Date.now()).toLocaleString()}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
