"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import AssistantPartsGrid from "@/components/AssistantPartsGrid";

export default function PortalPageClient() {
  const router = useRouter();
  const { user } = useUser();
  const displayId =
    (user?.primaryEmailAddress?.emailAddress as string | undefined) ||
    (user?.emailAddresses && user.emailAddresses[0]?.emailAddress) ||
    user?.firstName ||
    user?.fullName ||
    "Signed-in user";

  const allStatuses = ["pending", "processing", "completed", "canceled"];
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(["pending"]);
  const toggleStatus = (status: string) =>
    setSelectedStatuses((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );

  const invoices = useQuery(api.invoices.getInvoicesByStatuses, {
    statuses: selectedStatuses,
  });

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Client Portal</h1>
          <p className="text-sm text-muted-foreground">
            Track repairs, parts, and invoices. Click a part to edit schema and price.
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <span className="text-xs text-muted">Signed in as {displayId}</span>
          <Button onClick={() => router.push("/account")}>Account</Button>
        </div>
      </div>

      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 min-w-0">
            <h2 className="font-medium text-lg mb-2">Parts</h2>
            <AssistantPartsGrid />
          </div>

          <div className="w-full md:w-96">
            <h3 className="text-lg font-medium mb-2">Invoices</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Invoices appear here based on selected statuses.
            </p>

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
        </div>
      </Card>
    </div>
  );
}
