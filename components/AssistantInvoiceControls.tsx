import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import AssistantInvoiceControls from "@/components/AssistantInvoiceControls";
import PartRecommendation from "@/components/PartRecommendation";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function PortalPageClient() {
  const router = useRouter();
  const { isLoaded, isSignedIn, user } = useUser();

  // Display identifier for the signed-in user
  const displayId =
    (user?.primaryEmailAddress?.emailAddress as string | undefined) ||
    (user?.emailAddresses && user.emailAddresses[0]?.emailAddress) ||
    user?.firstName ||
    user?.fullName ||
    "Signed-in user";

  // Status filtering
  const allStatuses = ["pending", "processing", "completed", "canceled"];
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(["pending"]);
  const toggleStatus = (status: string) => {
    setSelectedStatuses((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
  };

  // Live Convex query: fetch invoices by multiple statuses
  const invoices = useQuery(api.invoices.getInvoicesByStatuses, {
    statuses: selectedStatuses,
  });

  // --- Derive "previous request" (latest invoice) ---
  // Convex docs typically include _creationTime. We sort descending and pick first.
  const latestInvoice = useMemo(() => {
    if (!invoices || invoices.length === 0) return null;
    return [...invoices].sort(
      (a: any, b: any) => (b._creationTime ?? 0) - (a._creationTime ?? 0)
    )[0];
  }, [invoices]);

  // Build a readable “last assistant intake” text from latest invoice fields.
  const lastAssistantText = useMemo(() => {
    if (!latestInvoice) return "";
    const lines: string[] = [];
    if (latestInvoice.ticketId) lines.push(`ID: ${latestInvoice.ticketId}`);
    if (latestInvoice.name) lines.push(`Name: ${latestInvoice.name}`);
    if (latestInvoice.email) lines.push(`Email: ${latestInvoice.email}`);
    if (latestInvoice.phone) lines.push(`Phone: ${latestInvoice.phone}`);
    if (latestInvoice.description) lines.push(`Description: ${latestInvoice.description}`);
    if (latestInvoice.service) lines.push(`Service: ${latestInvoice.service}`);
    if (latestInvoice.quote != null)
      lines.push(
        `Quote: ${
          typeof latestInvoice.quote === "number"
            ? `$${latestInvoice.quote.toFixed(2)}`
            : latestInvoice.quote
        }`
      );
    if (latestInvoice.status) lines.push(`Status: ${latestInvoice.status}`);
    return lines.join("\n");
  }, [latestInvoice]);

  // Use latest invoice description (or empty) to feed PartRecommendation
  const latestQueryForParts =
    (latestInvoice?.description as string | undefined)?.trim() ?? "";

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Client Portal</h1>
          <p className="text-sm text-muted-foreground">
            Track repairs, parts quotes, and invoices. The latest request is shown below.
          </p>
        </div>

        <div className="flex gap-2 items-center">
          <span className="text-xs text-muted">Signed in as {displayId}</span>
          <Button onClick={() => router.push("/account")}>Account</Button>
        </div>
      </div>

      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-6">
          {/* ----------- Left Side (Previous Request + Parts) ----------- */}
          <div className="flex-1 min-w-0">
            <h2 className="font-medium text-lg mb-2">Previous Request</h2>
            <p className="text-sm text-muted-foreground">
              This is the most recent intake saved as an invoice.
            </p>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Part Recommendations */}
              <div>
                <div className="text-sm text-muted mb-2">
                  Live Parts (based on latest invoice description)
                </div>
                <PartRecommendation query={latestQueryForParts} />
              </div>

              {/* Latest Intake Summary (no live chat) */}
              <div>
                <div className="text-sm text-muted mb-2">Latest Intake Summary</div>
                {lastAssistantText ? (
                  <pre className="mt-2 text-xs bg-gray-50 dark:bg-neutral-900 p-3 rounded whitespace-pre-wrap">
                    {lastAssistantText}
                  </pre>
                ) : (
                  <p className="text-sm text-muted-foreground mt-2">
                    No recent intake found. Create an invoice from the dashboard or via your
                    assistant workflow.
                  </p>
                )}

                <div className="mt-4">
                  {/* Reuse your existing controls by feeding them the synthesized summary text */}
                  <AssistantInvoiceControls lastAssistantText={lastAssistantText} />
                </div>
              </div>
            </div>
          </div>

          {/* ----------- Right Side (Invoices) ----------- */}
          <div className="w-full md:w-96">
            <h3 className="text-lg font-medium mb-2">Invoices</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Invoices created by the assistant or dashboard appear here.
            </p>

            {/* Status Filter Controls */}
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
                {invoices === undefined ? (
                  <div className="text-sm text-muted-foreground">Loading invoices...</div>
                ) : invoices.length === 0 ? (
                  <div className="text-sm text-muted-foreground">
                    No invoices found for selected statuses.
                  </div>
                ) : (
                  <ul className="space-y-2 text-sm">
                    {invoices.map((inv: any) => (
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

              {/* Admin Actions */}
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
          {/* End Right */}
        </div>
      </Card>

      {/* No live assistant chat included on this page */}
    </div>
  );
}
