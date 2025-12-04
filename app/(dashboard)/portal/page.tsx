"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import { useUser } from "@clerk/nextjs";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import AssistantLauncher from "@/components/assistant-launcher";
import AssistantPartsGrid from "@/components/AssistantPartsGrid";
import { toast } from "sonner";

// ----------------------------- constants -----------------------------
const SERVICE_FEE = 85;

const ALL_INVOICE_STATUSES = ["pending", "processing", "completed", "canceled"] as const;

const JOB_STATUSES = [
  "received",
  "diagnosis",
  "awaiting_parts",
  "repair",
  "qa",
  "ready",
  "delivered",
  "on_hold",
] as const;

const JOB_STATUS_LABEL: Record<string, string> = {
  received: "Device Received",
  diagnosis: "Diagnosis",
  awaiting_parts: "Awaiting Parts",
  repair: "Repair In Progress",
  qa: "Quality Assurance",
  ready: "Ready",
  delivered: "Delivered",
  on_hold: "On Hold",
};

// ----------------------------- types -----------------------------
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
  cost?: number;
  currency?: string;
  sku?: string;
  vendor?: string;
  stock?: number;
  tags?: string[];
  metadata?: any;
  createdAt?: number;
  updatedAt: number;
};

type AnyIntake = {
  _id: string;
  customerName: string;
  deviceModel: string;
  issueDescription: string;
  requestedService?: string;
  notes?: string;
  contact?: { phone?: string; email?: string };
  status?: "draft" | "submitted" | "cancelled";
  createdAt: number;
};

type AnyJob = {
  _id: string;
  userId: string; // Id<"users"> but keep string for UI
  deviceModel: string;
  serial?: string;
  issue: string;
  orderNumber: string;
  status?: string;
  publicAccessToken?: string;
  publicAccessTokenExp?: number;
  createdAt: number;
  updatedAt: number;
  createdBy?: string;
};

// ----------------------------- helpers -----------------------------
function calcDeposit(quote: number | null | undefined) {
  if (!quote || quote <= 0) return 0;
  return Math.ceil(quote * 0.5);
}

function fmtMoney(n?: number | null, currency?: string) {
  if (n == null) return "";
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency || "USD",
      maximumFractionDigits: 2,
    }).format(n);
  } catch {
    return `$${n.toFixed(2)}`;
  }
}

function shortId(id: string) {
  return id.slice(0, 6) + "…" + id.slice(-4);
}

// ----------------------------- page -----------------------------
export default function PortalPage() {
  const router = useRouter();
  const { user } = useUser();

  const displayId =
    user?.primaryEmailAddress?.emailAddress ||
    user?.emailAddresses?.[0]?.emailAddress ||
    user?.fullName ||
    user?.firstName ||
    "Signed-in user";

  // UI state
  const [deviceSearch, setDeviceSearch] = useState("iPhone 12");
  const [serviceSearch, setServiceSearch] = useState("Screen replacement");

  const [selectedInvoiceStatuses, setSelectedInvoiceStatuses] = useState<string[]>(["pending"]);
  const [activeInvoiceId, setActiveInvoiceId] = useState<string | null>(null);

  const [jobsSearch, setJobsSearch] = useState("");
  const [selectedJobStatuses, setSelectedJobStatuses] = useState<string[]>(["received", "diagnosis", "awaiting_parts", "repair", "qa", "ready"]);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);

  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);

  // local optimistic invoice edits (no update mutation in your function list)
  const [localInvoices, setLocalInvoices] = useState<AnyInvoice[]>([]);

  // ----------------------------- queries -----------------------------
  const invoices = useQuery(api.invoices.getInvoicesByStatuses, {
    statuses: ALL_INVOICE_STATUSES as unknown as string[],
    limitPerStatus: 100,
  }) as AnyInvoice[] | undefined;

  const inventory = useQuery(api.inventoryParts.listAll, {
    limit: 500,
  }) as AnyInventory[] | undefined;

  const intakeSubmitted = useQuery(api.intakeDrafts.listByStatus, {
    status: "submitted",
    limit: 50,
  }) as AnyIntake[] | undefined;

  const jobs = useQuery(api.jobs.listForStaff, {
    search: jobsSearch.trim() || undefined,
  }) as AnyJob[] | undefined;

  // ----------------------------- mutations/actions -----------------------------
  const jobsUpdateStatus = useMutation(api.jobs.updateStatus);
  const jobsAddEvent = useMutation(api.jobs.addEvent);
  const jobsIssuePublicLink = useMutation(api.jobs.issuePublicLink);
  const qsPassQA = useMutation(api.qs.passQA);

  const invoicesCreate = useMutation(api.invoices.create);
  const manualQuoteCalculate = useAction(api.manualQuotes.calculate);

  // ----------------------------- effects -----------------------------
  useEffect(() => {
    if (!invoices) return;
    setLocalInvoices(
      invoices.slice().sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
    );
  }, [invoices]);

  const partsQuery = `${deviceSearch} ${serviceSearch}`.trim();

  // ----------------------------- derived -----------------------------
  const filteredInvoices = useMemo(() => {
    if (!localInvoices.length) return [] as AnyInvoice[];
    return localInvoices.filter((inv) =>
      selectedInvoiceStatuses.includes(inv.status || "pending")
    );
  }, [localInvoices, selectedInvoiceStatuses]);

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

  const filteredJobs = useMemo(() => {
    if (!jobs) return [] as AnyJob[];
    return jobs.filter((j) => selectedJobStatuses.includes(j.status || "received"));
  }, [jobs, selectedJobStatuses]);

  const activeJob = useMemo(
    () => filteredJobs.find((j) => j._id === activeJobId) || null,
    [filteredJobs, activeJobId]
  );

  // ----------------------------- UI handlers -----------------------------
  const toggleInvoiceStatus = (s: string) => {
    setSelectedInvoiceStatuses((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const toggleJobStatusFilter = (s: string) => {
    setSelectedJobStatuses((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const updateLocalInvoice = (id: string, patch: Partial<AnyInvoice> & { raw?: any }) => {
    setLocalInvoices((prev) =>
      prev.map((inv) =>
        inv._id === id
          ? { ...inv, ...patch, raw: { ...(inv.raw || {}), ...(patch.raw || {}) } }
          : inv
      )
    );
  };

  const handleQuoteChange = (inv: AnyInvoice, value: string) => {
    const q = parseFloat(value || "0");
    if (!q || q <= 0) return;
    const rounded = Math.ceil(q);
    updateLocalInvoice(inv._id, {
      quote: rounded,
      deposit: calcDeposit(rounded).toFixed(2),
    });
    toast.message("Quote updated locally. Add invoices.update mutation to persist.");
  };

  const handleInvoiceStatusChange = (inv: AnyInvoice, status: string) => {
    updateLocalInvoice(inv._id, { status });
    toast.message("Status updated locally. Add invoices.update mutation to persist.");
  };

  const handleApproveQuote = (inv: AnyInvoice) => {
    const q = Math.ceil(inv.quote || 0);
    const deposit = calcDeposit(q);
    updateLocalInvoice(inv._id, {
      quote: q,
      deposit: deposit.toFixed(2),
      status: "processing",
      raw: { approvedByStaff: true, approvedAt: Date.now() },
    });
    toast.success(`Approved. Deposit due: $${deposit.toFixed(2)} (local only).`);
  };

  const handleRunManualQuote = async (inv: AnyInvoice) => {
    try {
      const items = (inv.raw?.items ?? []).map((x: any) => ({
        title: x.title ?? inv.service ?? "Repair",
        partPrice: x.partPrice,
        labor: x.labor,
        qty: x.qty ?? 1,
      }));
      const res = await manualQuoteCalculate({
        items,
        taxRate: 0,
        deposit: 0,
        service: inv.service ?? "Repair",
        persistInvoice: false,
        customer: {
          name: inv.name ?? undefined,
          email: inv.email ?? undefined,
          phone: inv.phone ?? undefined,
          manufacturer: inv.manufacturer ?? undefined,
          description: inv.description ?? undefined,
        },
      });
      updateLocalInvoice(inv._id, {
        quote: res.total,
        deposit: res.deposit.toFixed(2),
        raw: { ...(inv.raw || {}), manualQuote: res },
      });
      toast.success("Manual quote recalculated (local).");
    } catch (e: any) {
      toast.error(e?.message ?? "Manual quote failed");
    }
  };

  const handleNewInvoiceFromActiveJob = async () => {
    if (!activeJob) return toast.message("Select a job first.");
    try {
      const ticketId =
        (globalThis.crypto as any)?.randomUUID?.() ??
        `t_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;

      const createdAt = Date.now();
      const res = await invoicesCreate({
        ticketId,
        name: null,
        email: null,
        phone: null,
        manufacturer: null,
        description: `${activeJob.deviceModel} — ${activeJob.issue}`,
        quote: null,
        deposit: "0",
        service: "Repair",
        warrantyAcknowledged: true,
        raw: { jobId: activeJob._id, orderNumber: activeJob.orderNumber },
        status: "pending",
        createdAt,
      });

      toast.success(`Invoice created: ${ticketId}`);
      setActiveInvoiceId((res as any)._id ?? null);
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to create invoice.");
    }
  };

  const handleJobSetStatus = async (job: AnyJob, status: string, message?: string) => {
    try {
      await jobsUpdateStatus({
        jobId: job._id as any,
        status,
        message,
      });
      toast.success(`Job set to ${JOB_STATUS_LABEL[status] ?? status}`);
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to update job status.");
    }
  };

  const handleJobAddNote = async (job: AnyJob) => {
    const msg = prompt("Note for this job?");
    if (!msg) return;
    try {
      await jobsAddEvent({
        jobId: job._id as any,
        type: "note",
        message: msg,
      });
      toast.success("Note added.");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to add note.");
    }
  };

  const handleJobPassQA = async (job: AnyJob) => {
    try {
      await qsPassQA({ jobId: job._id as any });
      toast.success("QA passed → job ready.");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to pass QA.");
    }
  };

  const handleGeneratePublicLink = async (job: AnyJob) => {
    try {
      const res = await jobsIssuePublicLink({
        jobId: job._id as any,
        ttlMinutes: 60 * 24 * 3, // 3 days
      });
      const url = `${window.location.origin}/portal/${res.orderNumber}?token=${res.token}`;
      await navigator.clipboard.writeText(url);
      toast.success("Client link copied to clipboard.");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to generate public link.");
    }
  };

  // ----------------------------- render -----------------------------
  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Portal</h1>
          <p className="text-sm text-muted-foreground">
            Internal staff view: repairs, invoices, intake, and inventory tied to Convex jobs pipeline.
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="text-xs text-muted-foreground">Signed in as {displayId}</span>
          <div className="flex gap-2">
            <AssistantLauncher />
            <Button
              size="sm"
              variant="outline"
              onClick={() => router.push("/account" as Route)}
            >
              Account
            </Button>
          </div>
        </div>
      </div>

      {/* Top: Assistant parts + Invoices/Intake */}
      <Card className="p-4 space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* Assistant Parts Lookup */}
          <div className="lg:col-span-3 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-medium">Assistant Parts Lookup</h2>
                <p className="text-xs text-muted-foreground">
                  Search parts by device + service. Approve parts to feed manual quotes.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                className="flex-1"
                placeholder="Device (e.g. iPhone 12)"
                value={deviceSearch}
                onChange={(e) => setDeviceSearch(e.target.value)}
              />
              <Input
                className="flex-1"
                placeholder="Service (e.g. Screen replacement)"
                value={serviceSearch}
                onChange={(e) => setServiceSearch(e.target.value)}
              />
            </div>

            <div className="border rounded-lg p-3 min-h-[140px]">
              <AssistantPartsGrid
                query={partsQuery}
                onApprove={(p: any) => {
                  toast.message(
                    `Approved: ${p?.title ?? "part"} — total ${fmtMoney(p?.total)}`
                  );
                }}
              />
            </div>
          </div>

          {/* Intake + Invoices */}
          <div className="lg:col-span-2 space-y-3">
            <div>
              <h2 className="text-lg font-medium">Intake / Invoices</h2>
              <p className="text-xs text-muted-foreground">
                Recent intakes and invoices. Quotes editable locally until invoices.update exists.
              </p>
            </div>

            {/* Invoice status filters */}
            <div className="flex flex-wrap gap-2">
              {ALL_INVOICE_STATUSES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleInvoiceStatus(s)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition ${
                    selectedInvoiceStatuses.includes(s)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted text-muted-foreground hover:bg-background"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Invoices list */}
            <div className="border rounded p-3 min-h-[160px]">
              {!localInvoices.length ? (
                <div className="text-xs text-muted-foreground">
                  {invoices === undefined ? "Loading invoices..." : "No invoices yet."}
                </div>
              ) : filteredInvoices.length === 0 ? (
                <div className="text-xs text-muted-foreground">
                  No invoices in selected statuses.
                </div>
              ) : (
                <ul className="space-y-2 text-xs">
                  {filteredInvoices.map((inv) => {
                    const quote = inv.quote || 0;
                    const deposit = calcDeposit(quote);
                    const active = activeInvoiceId === inv._id;

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
                              {inv.description || "Invoice"}
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
                              {quote > 0 ? fmtMoney(quote) : "Quote TBD"}
                            </div>
                            <div className="text-[10px] capitalize text-muted-foreground">
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
                                Deposit 50%: {fmtMoney(deposit)}
                              </span>

                              <select
                                className="text-[11px] border rounded px-1 py-0.5 bg-background"
                                value={inv.status}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  handleInvoiceStatusChange(inv, e.target.value);
                                }}
                                onClick={(e) => e.stopPropagation()}
                              >
                                {ALL_INVOICE_STATUSES.map((s) => (
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
                                Approve & take deposit
                              </Button>

                              <Button
                                size="xs"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRunManualQuote(inv);
                                }}
                              >
                                Recalc manual quote
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

            {/* Manual quote queue */}
            {manualQuotes.length > 0 && (
              <div className="border rounded p-3">
                <div className="text-sm font-medium mb-2">Needs quote</div>
                <div className="space-y-2 text-xs">
                  {manualQuotes.slice(0, 4).map((inv) => (
                    <div key={inv._id} className="flex justify-between items-center gap-2">
                      <div className="truncate">{inv.description}</div>
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => setActiveInvoiceId(inv._id)}
                      >
                        Open
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Intake summaries */}
            <div className="border rounded p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium">Recent Intakes</div>
                <span className="text-[11px] text-muted-foreground">
                  submitted
                </span>
              </div>

              {intakeSubmitted === undefined ? (
                <div className="text-xs text-muted-foreground">Loading intakes…</div>
              ) : intakeSubmitted.length === 0 ? (
                <div className="text-xs text-muted-foreground">No submitted intakes.</div>
              ) : (
                <div className="space-y-2 text-xs max-h-[180px] overflow-auto">
                  {intakeSubmitted.map((i) => (
                    <div
                      key={i._id}
                      className="border rounded p-2 space-y-0.5"
                    >
                      <div className="font-medium truncate">
                        {i.customerName} • {i.deviceModel}
                      </div>
                      <div className="text-muted-foreground line-clamp-2">
                        {i.issueDescription}
                      </div>
                      {i.requestedService && (
                        <div className="text-[11px] text-muted-foreground">
                          Requested: {i.requestedService}
                        </div>
                      )}
                      <div className="text-[10px] text-muted-foreground">
                        {new Date(i.createdAt).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Middle: Repairs (Jobs) + Actions */}
      <Card className="p-4 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center gap-3 justify-between">
          <div>
            <h2 className="text-lg font-medium">Repairs (Jobs)</h2>
            <p className="text-xs text-muted-foreground">
              Staff-only job list. Status updates write to Convex + create jobEvents.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              placeholder="Search order # or serial..."
              value={jobsSearch}
              onChange={(e) => setJobsSearch(e.target.value)}
              className="sm:w-64"
            />
            {activeJob && (
              <Button size="sm" variant="outline" onClick={handleNewInvoiceFromActiveJob}>
                Create invoice from job
              </Button>
            )}
          </div>
        </div>

        {/* Job status filters */}
        <div className="flex flex-wrap gap-2">
          {JOB_STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => toggleJobStatusFilter(s)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition ${
                selectedJobStatuses.includes(s)
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted text-muted-foreground hover:bg-background"
              }`}
            >
              {JOB_STATUS_LABEL[s]}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* Jobs list */}
          <div className="lg:col-span-2 border rounded p-3 min-h-[180px]">
            {jobs === undefined ? (
              <div className="text-xs text-muted-foreground">Loading jobs…</div>
            ) : filteredJobs.length === 0 ? (
              <div className="text-xs text-muted-foreground">No jobs match filters.</div>
            ) : (
              <ul className="space-y-2 text-sm">
                {filteredJobs.map((j) => {
                  const active = activeJobId === j._id;
                  const status = j.status || "received";

                  return (
                    <li
                      key={j._id}
                      className={`border rounded p-2 cursor-pointer ${
                        active ? "bg-muted/60 border-primary" : "hover:bg-muted/40"
                      }`}
                      onClick={() =>
                        setActiveJobId((prev) => (prev === j._id ? null : j._id))
                      }
                    >
                      <div className="flex justify-between gap-2">
                        <div className="min-w-0">
                          <div className="font-medium truncate">
                            #{j.orderNumber} • {j.deviceModel}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {j.issue}
                          </div>
                          <div className="text-[10px] text-muted-foreground truncate">
                            SN: {j.serial ?? "—"} • Job: {shortId(j._id)}
                          </div>
                        </div>

                        <div className="text-right">
                          <Badge variant="secondary" className="text-[11px]">
                            {JOB_STATUS_LABEL[status] ?? status}
                          </Badge>
                          <div className="text-[10px] text-muted-foreground mt-1">
                            {new Date(j.updatedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Active job quick actions */}
          <div className="border rounded p-3 space-y-2">
            <div className="text-sm font-medium">Job Actions</div>

            {!activeJob ? (
              <div className="text-xs text-muted-foreground">
                Select a job to manage statuses and client link.
              </div>
            ) : (
              <>
                <div className="text-xs text-muted-foreground">
                  Active: #{activeJob.orderNumber} • {activeJob.deviceModel}
                </div>

                <div className="flex flex-wrap gap-1">
                  <Button size="xs" onClick={() => handleJobSetStatus(activeJob, "diagnosis")}>
                    Diagnosis
                  </Button>
                  <Button size="xs" onClick={() => handleJobSetStatus(activeJob, "awaiting_parts")}>
                    Awaiting Parts
                  </Button>
                  <Button size="xs" onClick={() => handleJobSetStatus(activeJob, "repair")}>
                    Repair
                  </Button>
                  <Button size="xs" onClick={() => handleJobSetStatus(activeJob, "qa")}>
                    QA
                  </Button>
                  <Button size="xs" onClick={() => handleJobSetStatus(activeJob, "ready")}>
                    Ready
                  </Button>
                  <Button size="xs" onClick={() => handleJobSetStatus(activeJob, "delivered")}>
                    Delivered
                  </Button>
                </div>

                <div className="flex flex-wrap gap-1">
                  <Button size="xs" variant="outline" onClick={() => handleJobPassQA(activeJob)}>
                    Pass QA (qs.passQA)
                  </Button>
                  <Button size="xs" variant="outline" onClick={() => handleJobAddNote(activeJob)}>
                    Add note (jobs.addEvent)
                  </Button>
                </div>

                <div className="flex flex-wrap gap-1">
                  <Button size="xs" variant="secondary" onClick={() => handleGeneratePublicLink(activeJob)}>
                    Generate client link
                  </Button>
                  <Button
                    size="xs"
                    variant="ghost"
                    onClick={() =>
                      router.push(`/portal/${activeJob.orderNumber}` as Route)
                    }
                  >
                    Open public view
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </Card>

      {/* Bottom: Inventory */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Devices */} <Card className="p-4 space-y-3 lg:col-span-1">

          <h2 className="text-lg font-medium">Devices & Parts</h2>
          <p className="text-xs text-muted-foreground">
            Newest inventory activity. Select a device to view stocked parts.
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

        {/* Inventory items */}
        <Card className="p-4 space-y-3 lg:col-span-2">
          <h2 className="text-lg font-medium">
            Inventory for {selectedDevice || "selected device"}
          </h2>
          <p className="text-xs text-muted-foreground">
            Shows part price + ${SERVICE_FEE} service fee and stock levels.
          </p>

          {!selectedDevice ? (
            <div className="text-xs text-muted-foreground">
              Select a device on the left.
            </div>
          ) : inventoryForSelectedDevice.length === 0 ? (
            <div className="text-xs text-muted-foreground">
              No inventory items for {selectedDevice}.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 max-h-[520px] overflow-auto">
              {inventoryForSelectedDevice.map((p) => {
                const total = (p.price ?? 0) + SERVICE_FEE;
                return (
                  <Card key={p._id} className="p-3 space-y-1">
                    <div className="font-medium text-sm line-clamp-2">
                      {p.name}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      Category: {p.category ?? p.metadata?.category ?? "—"}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      SKU: {p.sku ?? p.vendorSku ?? "—"}
                    </div>
                    <div className="text-sm font-semibold">
                      {fmtMoney(p.price, p.currency)}{" "}
                      <span className="text-[11px] font-normal text-muted-foreground">
                        + fee {fmtMoney(SERVICE_FEE)}
                      </span>
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      Total service: {fmtMoney(total, p.currency)}
                    </div>
                    <div className="text-[11px]">
                      Stock:{" "}
                      <span className="font-medium">
                        {p.stock ?? "—"}
                      </span>
                    </div>

                    {p.vendor && (
                      <div className="text-[10px] text-muted-foreground">
                        Vendor: {p.vendor}
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
