"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AssistantLauncher from "@/components/assistant-launcher";
import AssistantPartsGrid from "@/components/AssistantPartsGrid";

const SERVICE_FEE = 85;
const ALL_STATUSES = ["pending", "processing", "completed", "canceled"] as const;

type AnyInvoice = {
  _id: string;
  ticketId: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  manufacturer: string | null;
  description: string;
  quote: number | null;
  deposit: string;
  service: string;
  warrantyAcknowledged: boolean;
  raw: any;
  status: string;
  createdAt?: number;
};

type AnyInventory = {
  _id: string;
  name: string;
  device?: string;
  category?: string;
  price?: number;
  stock?: number;
  metadata?: any;
  createdAt?: number;
};

type AnyIntake = {
  _id: string;
  customerName: string;
  deviceModel: string;
  issueDescription: string;
  requestedService?: string;
  notes?: string;
  contact?: {
    phone?: string;
    email?: string;
  };
  status?: string;
  createdAt: number;
};

export default function PortalPage() {
  const router = useRouter();
  const { user } = useUser();

  const displayId =
    (user?.primaryEmailAddress?.emailAddress as string | undefined) ||
    (user?.emailAddresses && user.emailAddresses[0]?.emailAddress) ||
    user?.firstName ||
    user?.fullName ||
    "Signed-in user";

  const [deviceSearch, setDeviceSearch] = useState("iPhone 12");
  const [serviceSearch, setServiceSearch] = useState("Screen replacement");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(["pending"]);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [activeInvoiceId, setActiveInvoiceId] = useState<string | null>(null);

  const [localInvoices, setLocalInvoices] = useState<AnyInvoice[]>([]);

  const invoices = useQuery(api.invoices.getInvoicesByStatuses, {
    statuses: ALL_STATUSES as unknown as string[],
    limitPerStatus: 100,
  }) as AnyInvoice[] | undefined;

  const inventory = useQuery(api.inventoryParts.listAll, {
    limit: 500,
  }) as AnyInventory[] | undefined;

  const intakeSubmitted = useQuery(api.intakeDrafts.listByStatus, {
    status: "submitted",
    limit: 50,
  }) as AnyIntake[] | undefined;

  useEffect(() => {
    if (!invoices) return;
    setLocalInvoices(
      invoices
        .slice()
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
    );
  }, [invoices]);

  const partsQuery = `${deviceSearch} ${serviceSearch}`.trim();

  const filteredInvoices = useMemo(() => {
    if (!localInvoices.length) return [] as AnyInvoice[];
    return localInvoices.filter((inv) =>
      selectedStatuses.includes(inv.status || "pending")
    );
  }, [localInvoices, selectedStatuses]);

  const manualQuotes = useMemo(() => {
    return localInvoices
      .filter((inv) => inv.status === "pending" && (!inv.quote || inv.quote <= 0))
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }, [localInvoices]);

  const deviceCards = useMemo(() => {
    if (!inventory) return [] as {
      device: string;
      count: number;
      latest: number;
      sample: AnyInventory;
    }[];
    const map = new Map<
      string,
      { device: string; count: number; latest: number; sample: AnyInventory }
    >();
    for (const item of inventory) {
      const dev = item.device || "Unknown device";
      const existing = map.get(dev);
      if (!existing) {
        map.set(dev, {
          device: dev,
          count: 1,
          latest: item.createdAt || 0,
          sample: item,
        });
      } else {
        existing.count += 1;
        if ((item.createdAt || 0) > existing.latest) {
          existing.latest = item.createdAt || 0;
          existing.sample = item;
        }
      }
    }
    return [...map.values()].sort((a, b) => b.latest - a.latest);
  }, [inventory]);

  const inventoryForSelectedDevice = useMemo(() => {
    if (!inventory || !selectedDevice) return [] as AnyInventory[];
    return inventory
      .filter((i) => (i.device || "Unknown device") === selectedDevice)
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }, [inventory, selectedDevice]);

  const toggleStatus = (status: string) => {
    setSelectedStatuses((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
  };

  const updateLocalInvoice = (id: string, patch: Partial<AnyInvoice> & { raw?: any }) => {
    setLocalInvoices((prev) =>
      prev.map((inv) =>
        inv._id === id
          ? {
              ...inv,
              ...patch,
              raw: { ...(inv.raw || {}), ...(patch.raw || {}) },
            }
          : inv
      )
    );
  };

  const calcDeposit = (quote: number | null | undefined) => {
    if (!quote || quote <= 0) return 0;
    return Math.ceil(quote * 0.5);
  };

  const handleApproveQuote = (inv: AnyInvoice) => {
    const q = inv.quote || 0;
    const rounded = Math.ceil(q);
    const deposit = calcDeposit(rounded);
    updateLocalInvoice(inv._id, {
      quote: rounded,
      deposit: deposit.toFixed(2),
      status: "processing",
      raw: { approvedByGuest: true, approvedAt: Date.now() },
    });
    alert(`Invoice approved with 50% deposit: $${deposit.toFixed(2)}`);
  };

  const handleSaveForLater = (inv: AnyInvoice) => {
    updateLocalInvoice(inv._id, {
      raw: { savedForLater: true },
    });
    alert("Saved for later. You can wire this to a real mutation when ready.");
  };

  const handleMarkEconomicChoice = (inv: AnyInvoice) => {
    updateLocalInvoice(inv._id, {
      raw: { econChoice: true },
    });
  };

  const handleQuoteChange = (inv: AnyInvoice, value: string) => {
    const q = parseFloat(value || "0");
    if (!q || q <= 0) return;
    const rounded = Math.ceil(q);
    const deposit = calcDeposit(rounded);
    updateLocalInvoice(inv._id, {
      quote: rounded,
      deposit: deposit.toFixed(2),
    });
  };

  const handleStatusChange = (inv: AnyInvoice, status: string) => {
    updateLocalInvoice(inv._id, {
      status,
    });
  };

  const handleSendManualQuoteBackToChat = (inv: AnyInvoice) => {
    console.log("Send manual quote back to chat", inv);
    alert("This quote would be sent back to assistant chat here.");
  };

  const handleNewInvoice = () => {
    alert("Open invoice create UI. Wire to Convex when ready.");
  };

  const handleNewIntake = () => {
    alert("Open intake create UI. Wire to Convex when ready.");
  };

  const handleBulkEditInvoices = () => {
    alert("Open bulk edit UI. Wire to Convex when ready.");
  };

  const handleInventoryAddPart = () => {
    alert("Open inventory add part UI.");
  };

  const handleInventoryEdit = () => {
    alert("Open inventory edit UI.");
  };

  const isInvoiceActive = (id: string) => activeInvoiceId === id;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Client Portal</h1>
          <p className="text-sm text-muted-foreground">
            Parts, inventory, and intake summaries with editable status and pricing.
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="text-xs text-muted-foreground">Signed in as {displayId}</span>
          <div className="flex gap-2">
            <AssistantLauncher />
            <Button size="sm" variant="outline" onClick={() => router.push("/account")}>
              Account
            </Button>
          </div>
        </div>
      </div>

      <Card className="p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 min-w-0 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-medium">Assistant Parts Lookup</h2>
                <p className="text-xs text-muted-foreground">
                  Describe the device and service; parts feed into intake quotes.
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                className="flex-1 rounded border px-2 py-1 text-sm bg-background"
                placeholder="Device (e.g. iPhone 12)"
                value={deviceSearch}
                onChange={(e) => setDeviceSearch(e.target.value)}
              />
              <input
                className="flex-1 rounded border px-2 py-1 text-sm bg-background"
                placeholder="Service (e.g. Screen replacement)"
                value={serviceSearch}
                onChange={(e) => setServiceSearch(e.target.value)}
              />
            </div>
            <div className="border rounded-lg p-3 min-h-[120px]">
              <AssistantPartsGrid
                query={partsQuery}
                onApprove={(p: any) => {
                  alert(
                    `Part approved:\n${p.title}\nDevice: ${p.device}\nTotal: $${p.total?.toFixed?.(
                      2
                    )}`
                  );
                }}
              />
            </div>
          </div>

          <div className="w-full md:w-96 space-y-3">
            <div>
              <h2 className="text-lg font-medium">Intake Summaries / Invoices</h2>
              <p className="text-xs text-muted-foreground">
                Track progress and adjust pricing for recent incoming work.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 mb-2">
              {ALL_STATUSES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleStatus(s)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition ${
                    selectedStatuses.includes(s)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted text-muted-foreground hover:bg-background"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            <div className="border rounded p-3 min-h-[140px]">
              {!localInvoices.length ? (
                <div className="text-xs text-muted-foreground">
                  {invoices === undefined
                    ? "Loading summaries..."
                    : "No invoices available yet."}
                </div>
              ) : filteredInvoices.length === 0 ? (
                <div className="text-xs text-muted-foreground">
                  No invoices found for selected statuses.
                </div>
              ) : (
                <ul className="space-y-2 text-xs">
                  {filteredInvoices.map((inv) => {
                    const quote = inv.quote || 0;
                    const deposit = calcDeposit(quote);
                    const active = isInvoiceActive(inv._id);
                    return (
                      <li
                        key={inv._id}
                        className={`border rounded p-2 space-y-1 cursor-pointer ${
                          active ? "bg-muted/60" : "hover:bg-muted/40"
                        }`}
                        onClick={() =>
                          setActiveInvoiceId((prev) => (prev === inv._id ? null : inv._id))
                        }
                      >
                        <div className="flex justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">
                              {inv.description || "Intake summary"}
                            </div>
                            <div className="text-muted-foreground truncate">
                              {inv.name || inv.email || inv.phone || "Unknown customer"}
                            </div>
                            <div className="text-[10px] text-muted-foreground truncate">
                              Service: {inv.service} • Ticket: {inv.ticketId}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-semibold">
                              {quote > 0 ? `$${quote.toFixed(2)}` : "Quote TBD"}
                            </div>
                            <div
                              className={`text-[10px] capitalize ${
                                inv.status === "pending"
                                  ? "text-yellow-600"
                                  : inv.status === "completed"
                                  ? "text-green-600"
                                  : inv.status === "processing"
                                  ? "text-blue-600"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {inv.status}
                            </div>
                          </div>
                        </div>

                        {active && (
                          <div className="pt-2 border-t mt-1 space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <label className="text-[11px] flex items-center gap-1">
                                Quote $
                                <input
                                  type="number"
                                  defaultValue={quote || ""}
                                  className="w-20 rounded border px-1 py-0.5 text-[11px] bg-background"
                                  onBlur={(e) => handleQuoteChange(inv, e.target.value)}
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </label>
                              <span className="text-[11px] text-muted-foreground">
                                Deposit 50%: ${deposit.toFixed(2)}
                              </span>
                              <select
                                className="text-[11px] border rounded px-1 py-0.5 bg-background"
                                value={inv.status}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  handleStatusChange(inv, e.target.value);
                                }}
                                onClick={(e) => e.stopPropagation()}
                              >
                                {ALL_STATUSES.map((s) => (
                                  <option key={s} value={s}>
                                    {s}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div className="flex flex-wrap gap-1">
                              <Button
                                size="xs"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleApproveQuote(inv);
                                }}
                              >
                                Approve & take 50% deposit
                              </Button>
                              <Button
                                size="xs"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMarkEconomicChoice(inv);
                                }}
                              >
                                Mark economic choice
                              </Button>
                              <Button
                                size="xs"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSaveForLater(inv);
                                }}
                              >
                                Save for later
                              </Button>
                            </div>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="border rounded p-3">
              <div className="text-sm font-medium mb-1">Admin tools</div>
              <div className="flex gap-2 flex-wrap">
                <Button size="xs" variant="outline" onClick={handleNewInvoice}>
                  New invoice
                </Button>
                <Button size="xs" variant="outline" onClick={handleNewIntake}>
                  New intake
                </Button>
                <Button size="xs" variant="outline" onClick={handleBulkEditInvoices}>
                  Bulk edit
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-4 space-y-3 lg:col-span-1">
          <h2 className="text-lg font-medium">Devices & Parts</h2>
          <p className="text-xs text-muted-foreground">
            Cards sorted by newest inventory activity. Select a device to view available parts.
          </p>
          {inventory === undefined ? (
            <div className="text-xs text-muted-foreground">Loading inventory…</div>
          ) : deviceCards.length === 0 ? (
            <div className="text-xs text-muted-foreground">No inventory yet.</div>
          ) : (
            <div className="space-y-2 max-h-[380px] overflow-auto">
              {deviceCards.map((d) => (
                <button
                  key={d.device}
                  type="button"
                  onClick={() => setSelectedDevice(d.device)}
                  className={`w-full text-left border rounded-lg p-2 flex gap-2 items-center hover:bg-muted/40 transition ${
                    selectedDevice === d.device ? "bg-muted/60 border-primary" : ""
                  }`}
                >
                  <div className="h-10 w-10 rounded bg-muted flex items-center justify-center text-[10px]">
                    {d.device.split(" ")[0] || "Device"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{d.device}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {d.count} parts stocked
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-4 space-y-3 lg:col-span-1">
          <h2 className="text-lg font-medium">
            Inventory for {selectedDevice || "selected device"}
          </h2>
          <p className="text-xs text-muted-foreground">
            Part price + ${SERVICE_FEE} service fee and stock levels.
          </p>
          {!selectedDevice ? (
            <div className="text-xs text-muted-foreground">
              Select a device card to view inventory items.
            </div>
          ) : inventoryForSelectedDevice.length === 0 ? (
            <div className="text-xs text-muted-foreground">
              No inventory items for {selectedDevice}.
            </div>
          ) : (
            <ul className="space-y-2 text-xs max-h-[380px] overflow-auto">
              {inventoryForSelectedDevice.map((item) => {
                const base = item.price || 0;
                const total = base > 0 ? base + SERVICE_FEE : 0;
                return (
                  <li
                    key={item._id}
                    className="border rounded p-2 flex justify-between gap-2"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">
                        {item.name} {item.category ? `(${item.category})` : ""}
                      </div>
                      <div className="text-[11px] text-muted-foreground truncate">
                        Base part: {base > 0 ? `$${base.toFixed(2)}` : "TBD"} + $
                        {SERVICE_FEE} svc
                      </div>
                    </div>
                    <div className="text-right text-[11px]">
                      <div className="font-semibold">
                        {total > 0 ? `$${total.toFixed(2)}` : "TBD"}
                      </div>
                      <div className="text-muted-foreground">
                        Stock: {item.stock != null ? item.stock : "-"}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          <div className="pt-2 border-t mt-2 flex gap-2 flex-wrap">
            <Button size="xs" variant="outline" onClick={handleInventoryAddPart}>
              Add part
            </Button>
            <Button size="xs" variant="outline" onClick={handleInventoryEdit}>
              Edit inventory
            </Button>
          </div>
        </Card>

        <Card className="p-4 space-y-3 lg:col-span-1">
          <h2 className="text-lg font-medium">Manual Quotes (pending)</h2>
          <p className="text-xs text-muted-foreground">
            Quotes needing approval. Adjust, approve, or send back to chat.
          </p>
          {manualQuotes.length === 0 ? (
            <div className="text-xs text-muted-foreground">
              No pending manual quotes detected.
            </div>
          ) : (
            <ul className="space-y-2 text-xs max-h-[380px] overflow-auto">
              {manualQuotes.map((inv) => {
                const quote = inv.quote || 0;
                const deposit = calcDeposit(quote);
                return (
                  <li key={inv._id} className="border rounded p-2 space-y-2">
                    <div className="flex justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">
                          {inv.description || "Manual quote"}
                        </div>
                        <div className="text-muted-foreground truncate">
                          {inv.name || inv.email || inv.phone || "Unknown customer"}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold">
                          {quote > 0 ? `$${quote.toFixed(2)}` : "Quote TBD"}
                        </div>
                        <div className="text-[10px] text-yellow-700">Pending</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-[11px] flex items-center gap-1">
                        Quote $
                        <input
                          type="number"
                          defaultValue={quote || ""}
                          className="w-20 rounded border px-1 py-0.5 text-[11px] bg-background"
                          onBlur={(e) => handleQuoteChange(inv, e.target.value)}
                        />
                      </label>
                      <span className="text-[11px] text-muted-foreground">
                        Deposit 50%: ${deposit.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex gap-1 flex-wrap">
                      <Button size="xs" variant="outline" onClick={() => handleApproveQuote(inv)}>
                        Approve & continue intake
                      </Button>
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => handleSendManualQuoteBackToChat(inv)}
                      >
                        Send back to chat
                      </Button>
                      <Button
                        size="xs"
                        variant="ghost"
                        onClick={() => handleSaveForLater(inv)}
                      >
                        Save for later
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>

      <Card className="p-4 space-y-3">
        <h2 className="text-lg font-medium">Recent Intakes</h2>
        {intakeSubmitted === undefined ? (
          <div className="text-xs text-muted-foreground">Loading submitted intakes…</div>
        ) : !intakeSubmitted.length ? (
          <div className="text-xs text-muted-foreground">No submitted intakes yet.</div>
        ) : (
          <ul className="space-y-2 text-xs max-h-[260px] overflow-auto">
            {intakeSubmitted
              .slice()
              .sort((a, b) => b.createdAt - a.createdAt)
              .map((it) => (
                <li key={it._id} className="border rounded p-2 flex justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{it.customerName}</div>
                    <div className="text-muted-foreground truncate">
                      {it.deviceModel} — {it.issueDescription}
                    </div>
                    {it.requestedService && (
                      <div className="text-[11px] text-muted-foreground truncate">
                        Service: {it.requestedService}
                      </div>
                    )}
                    {it.notes && (
                      <div className="text-[11px] text-muted-foreground truncate">
                        Notes: {it.notes}
                      </div>
                    )}
                  </div>
                  <div className="text-right text-[11px] text-muted-foreground">
                    {it.contact?.phone && <div>{it.contact.phone}</div>}
                    {it.contact?.email && <div>{it.contact.email}</div>}
                    {it.status && <div className="capitalize mt-1">Status: {it.status}</div>}
                    <div className="mt-2 flex gap-1 justify-end">
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => alert("Edit intake – wire to Convex")}
                      >
                        Edit
                      </Button>
                      <Button
                        size="xs"
                        variant="ghost"
                        onClick={() => alert("Remove intake – wire to Convex")}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
