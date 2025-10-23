// app/portal/page.client.tsx (or wherever your PortalPageClient is)
"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import AssistantLauncher from "@/components/assistant-launcher";
import AssistantInvoiceControls from "@/components/AssistantInvoiceControls";
import PartRecommendation from "@/components/PartRecommendation";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function PortalPageClient() {
  const router = useRouter();
  const { isLoaded, user } = useUser();
  const [lastAssistantText, setLastAssistantText] = useState<string>("");

  // Signed-in display id
  const displayId =
    (user?.primaryEmailAddress?.emailAddress as string | undefined) ||
    (user?.emailAddresses && user.emailAddresses[0]?.emailAddress) ||
    user?.firstName ||
    user?.fullName ||
    "Signed-in user";

  // Status filter UI
  const allStatuses = ["pending", "processing", "completed", "canceled"];
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(["pending"]);
  const toggleStatus = (status: string) => {
    setSelectedStatuses((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
  };

  // Live invoices by statuses
  const invoices = useQuery(api.invoices.getInvoicesByStatuses, {
    statuses: selectedStatuses,
  });

  // Derive a parts query from the last Assistant summary text (best-effort).
  // We try to find lines like "Device: ..." and "Issue: ...".
  const { partsQuery, parsedSummary } = useMemo(() => {
    const text = lastAssistantText || "";
    // Try JSON first
    try {
      const data = JSON.parse(text);
      // If your assistant sends structured summary later, support it here:
      const device = data?.device || data?.Device || "";
      const issue = data?.issue || data?.Issue || data?.Service || "";
      const pq = [device, issue].filter(Boolean).join(" ");
      return { partsQuery: pq, parsedSummary: { device, issue } };
    } catch {
      // Fallback: parse lines from plain text
      // Accept formats:
      // • Device: iPhone 13 Pro Max
      // • Issue: screen cracked
      const devMatch =
        text.match(/(?:Device|Model)\s*:\s*(.+)/i) ||
        text.match(/^(?:Device|Model)\s*-\s*(.+)$/im);
      const issueMatch =
        text.match(/(?:Issue|Service)\s*:\s*(.+)/i) ||
        text.match(/^(?:Issue|Service)\s*-\s*(.+)$/im);

      // Or try: "<device> — <issue>"
      const dashPair = !devMatch && !issueMatch ? text.match(/^(.+?)\s+—\s+(.+)$/im) : null;

      const device =
        (devMatch && (devMatch[1] || "").trim()) ||
        (dashPair && (dashPair[1] || "").trim()) ||
        "";
      const issue =
        (issueMatch && (issueMatch[1] || "").trim()) ||
        (dashPair && (dashPair[2] || "").trim()) ||
        "";

      const pq = [device, issue].filter(Boolean).join(" ").trim();
      return { partsQuery: pq, parsedSummary: { device, issue } };
    }
  }, [lastAssistantText]);

  // Sort invoices: FIFO for "pending", LIFO for others.
  const sortedInvoices = useMemo(() => {
    if (!invoices) return undefined;
    const list = [...invoices];

    // If only "pending" is selected, show FIFO (oldest first).
    const onlyPending =
      selectedStatuses.length === 1 && selectedStatuses[0] === "pending";

    list.sort((a: any, b: any) => {
      const ca = a?.createdAt ?? 0;
      const cb = b?.createdAt ?? 0;
      if (onlyPending) {
        // FIFO for pending
        return ca - cb;
      }
      // newest first otherwise
      return cb - ca;
    });

    return list;
  }, [invoices, selectedStatuses]);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Client Portal</h1>
          <p className="text-sm text-muted-foreground">
            Track repairs, parts quotes, and invoices. Use the assistant to start or resume an intake.
          </p>
        </div>

        <div className="flex gap-2 items-center">
          <span className="text-xs text-muted">Signed in as {displayId}</span>
          <Button onClick={() => router.push("/account")}>Account</Button>
        </div>
      </div>

      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-6">
          {/* -------- Left: Assistant outputs + Parts -------- */}
          <div className="flex-1 min-w-0">
            <h2 className="font-medium text-lg mb-2">Repairs</h2>
            <p className="text-sm text-muted-foreground">
              Start a chat with the assistant to collect device information, fetch live part pricing, and create invoices.
            </p>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Parts driven by last assistant intake */}
              <div>
                <div className="text-sm text-muted mb-2">Live Parts (from last intake)</div>
                {/* Pass best-effort query — falls back to empty string */}
                <PartRecommendation query={partsQuery || ""} />
              </div>

              {/* Latest Assistant Intake (text only) */}
              <div>
                <div className="text-sm text-muted mb-2">Previous Intake (from Assistant)</div>

                {lastAssistantText ? (
                  <div className="space-y-2">
                    <pre className="mt-2 text-xs bg-gray-50 dark:bg-neutral-900 p-3 rounded whitespace-pre-wrap">
{lastAssistantText}
                    </pre>

                    {/* Quick summary chips if we parsed anything */}
                    {(parsedSummary.device || parsedSummary.issue) && (
                      <div className="flex flex-wrap gap-2">
                        {parsedSummary.device && (
                          <span className="px-2 py-1 text-xs rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                            Device: {parsedSummary.device}
                          </span>
                        )}
                        {parsedSummary.issue && (
                          <span className="px-2 py-1 text-xs rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                            Issue: {parsedSummary.issue}
                          </span>
                        )}
                        {partsQuery && (
                          <span className="px-2 py-1 text-xs rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Parts query ready
                          </span>
                        )}
                      </div>
                    )}

                    <div className="mt-4">
                      <AssistantInvoiceControls lastAssistantText={lastAssistantText} />
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground mt-2">
                    Start a conversation with the assistant (bottom-right). Your last intake will appear here.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* -------- Right: Invoices -------- */}
          <div className="w-full md:w-96">
            <h3 className="text-lg font-medium mb-2">Invoices</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Invoices created by the assistant appear here. Pending items are shown first-in, first-out.
            </p>

            {/* Status Filter */}
            <div className="mb-3 flex flex-wrap gap-2">
              {allStatuses.map((status) => (
                <label
                  key={status}
                  className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition ${
                    selectedStatuses.includes(status)
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedStatuses.includes(status)}
                    onChange={() => toggleStatus(status)}
                    className="hidden"
                  />
                  {status}
                </label>
              ))}
            </div>

            {/* Invoice List */}
            <div className="space-y-3">
              <div className="p-3 border rounded">
                {sortedInvoices === undefined ? (
                  <div className="text-sm text-muted-foreground">Loading invoices...</div>
                ) : sortedInvoices.length === 0 ? (
                  <div className="text-sm text-muted-foreground">
                    No invoices found for selected statuses.
                  </div>
                ) : (
                  <ul className="space-y-2 text-sm">
                    {sortedInvoices.map((inv: any) => (
                      <li
                        key={inv._id}
                        className="p-2 border rounded flex justify-between items-center hover:bg-gray-50 dark:hover:bg-neutral-900 transition"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">
                            {inv.description || "(no description)"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {inv.name || inv.email || "No customer info"}
                          </div>
                        </div>
                        <div className="ml-3 text-right">
                          <div className="font-semibold">
                            $
                            {typeof inv.quote === "number"
                              ? inv.quote.toFixed(2)
                              : inv.quote ?? "N/A"}
                          </div>
                          <div
                            className={`text-xs capitalize ${
                              inv.status === "pending"
                                ? "text-yellow-600"
                                : inv.status === "completed"
                                ? "text-green-600"
                                : inv.status === "processing"
                                ? "text-blue-600"
                                : "text-gray-500"
                            }`}
                          >
                            {inv.status}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Admin CTA */}
              <div className="p-3 border rounded">
                <div className="text-sm font-medium">Admin Actions</div>
                <div className="mt-2 flex gap-2">
                  <Button onClick={() => window.open("/app/portal/orders", "_self")}>
                    Place Orders
                  </Button>
                  <Button variant="outline" onClick={() => alert("Exporting...")}>
                    Export CSV
                  </Button>
                </div>
              </div>
            </div>
          </div>
          {/* /Right */}
        </div>
      </Card>

      {/* Floating assistant — still external to this page */}
      <AssistantLauncher onAssistantMessage={(m) => setLastAssistantText(m)} />
    </div>
  );
}
