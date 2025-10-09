"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import AssistantLauncher from "@/components/assistant-launcher";
import AssistantInvoiceControls from "@/components/AssistantInvoiceControls";
import PartRecommendation from "@/components/PartRecommendation";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";

export default function PortalPageClient() {
  const router = useRouter();
  const { isLoaded, isSignedIn, user } = useUser();
  const [lastAssistantText, setLastAssistantText] = useState<string>("");

  const displayId =
    (user?.primaryEmailAddress?.emailAddress as string | undefined) ||
    (user?.emailAddresses && user.emailAddresses[0]?.emailAddress) ||
    user?.firstName ||
    user?.fullName ||
    "Signed-in user";

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Client Portal</h1>
          <p className="text-sm text-muted-foreground">
            Track repairs, parts quotes, and invoices. Use the assistant (bottom-right) to intake customers.
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
            <h2 className="font-medium text-lg mb-2">Repairs</h2>
            <p className="text-sm text-muted-foreground">
              Start a chat with the assistant to collect device information, fetch live part pricing, and create invoices.
            </p>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted mb-2">Live Parts (based on last assistant result)</div>
                <PartRecommendation query={""} />
              </div>

              <div>
                <div className="text-sm text-muted mb-2">Latest Assistant Intake</div>
                {lastAssistantText ? (
                  <pre className="mt-2 text-xs bg-gray-50 dark:bg-neutral-900 p-3 rounded">{lastAssistantText}</pre>
                ) : (
                  <p className="text-sm text-muted-foreground mt-2">Start a conversation with the assistant (bottom-right).</p>
                )}

                <div className="mt-4">
                  <AssistantInvoiceControls lastAssistantText={lastAssistantText} />
                </div>
              </div>
            </div>
          </div>

          <div className="w-full md:w-96">
            <h3 className="text-lg font-medium mb-2">Invoices</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Invoices created by the assistant appear here with "pending" status until an admin places an order.
            </p>

            <div className="space-y-3">
              <div className="p-3 border rounded">No pending invoices found (hook up Convex list query here).</div>
              <div className="p-3 border rounded">
                <div className="text-sm">Admin Actions</div>
                <div className="mt-2 flex gap-2">
                  <Button onClick={() => window.open("/app/portal/orders", "_self")}>Place Orders</Button>
                  <Button variant="outline" onClick={() => alert("Exporting...")}>Export CSV</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <AssistantLauncher onAssistantMessage={(m) => setLastAssistantText(m)} />
    </div>
  );
}
