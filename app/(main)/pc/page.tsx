"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useQuery } from "convex/react";
import { useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function PCPage() {
  const sp = useSearchParams();
  const { isAuthenticated } = useConvexAuth();

  const [orderInput, setOrderInput] = useState(sp.get("order") ?? "");
  const [tokenInput, setTokenInput] = useState(sp.get("token") ?? "");

  const orderFromUrl = sp.get("order") ?? "";
  const tokenFromUrl = sp.get("token") ?? "";

  const usingUrlCreds = !!orderFromUrl && (!!tokenFromUrl || isAuthenticated);

  const data = useQuery(
    isAuthenticated
      ? api.jobs.getPublic // re-use same read path; token ignored by server when staff if you prefer
      : api.jobs.getPublic,
    usingUrlCreds
      ? { orderNumber: orderFromUrl || orderInput, token: (tokenFromUrl || tokenInput) ?? "" }
      : "skip"
  );

  const showPrompt =
    !usingUrlCreds ||
    data === undefined ||
    (data as any)?.error;

  return (
    <div className="mx-auto max-w-xl p-4 space-y-4">
      <h1 className="text-lg font-semibold">Repair Status</h1>

      {showPrompt && (
        <Card className="p-4 space-y-3">
          <div className="flex items-center gap-2 text-red-600 text-sm">
            <AlertCircle className="h-4 w-4" />
            <span>
              {isAuthenticated
                ? "Enter an order number to view."
                : "Access link missing. Enter your order number and token."}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2">
            <Input
              placeholder="Order number"
              value={orderInput}
              onChange={(e) => setOrderInput(e.target.value)}
            />
            {!isAuthenticated && (
              <Input
                placeholder="Access token"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
              />
            )}
            <Button
              onClick={() => {
                const p = new URLSearchParams();
                if (orderInput) p.set("order", orderInput);
                if (!isAuthenticated && tokenInput) p.set("token", tokenInput);
                const qs = p.toString();
                window.location.search = qs;
              }}
              disabled={!orderInput || (!isAuthenticated && !tokenInput)}
            >
              View status
            </Button>
          </div>
        </Card>
      )}

      {!showPrompt && data && (data as any).job && (
        <JobView jobData={data as any} />
      )}
    </div>
  );
}

function JobView({ jobData }: { jobData: any }) {
  const { job, events } = jobData;
  return (
    <div className="space-y-3">
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="text-base font-semibold">Order #{job.orderNumber}</div>
          <span className="text-xs px-2 py-1 rounded bg-muted">{job.status}</span>
        </div>
        <div className="mt-1 text-sm opacity-80">
          {job.deviceModel}
          {job.serial ? ` • SN: ${job.serial}` : ""}
        </div>
        {job.eta ? (
          <div className="mt-1 text-xs">ETA: {new Date(job.eta).toLocaleDateString()}</div>
        ) : null}
      </Card>

      <Card className="p-4">
        <div className="font-medium mb-2">Progress</div>
        <div className="space-y-3">
          {[...events].sort((a: any, b: any) => a.createdAt - b.createdAt).map((e: any) => (
            <div key={e._id}>
              <div className="text-sm">{labelFor(e.type)}</div>
              {e.message ? <div className="text-xs opacity-80">{e.message}</div> : null}
              <div className="text-[11px] opacity-60">{new Date(e.createdAt).toLocaleString()}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function labelFor(t: string) {
  if (t === "received") return "Device received";
  if (t === "diagnosis_started") return "Diagnosis started";
  if (t === "diagnosis_done") return "Diagnosis complete";
  if (t === "parts_ordered") return "Parts ordered";
  if (t === "parts_arrived") return "Parts arrived";
  if (t === "repair_started") return "Repair started";
  if (t === "repair_done") return "Repair completed";
  if (t === "qa_started") return "Quality check";
  if (t === "qa_passed") return "Quality check passed";
  if (t === "ready") return "Ready for pickup/delivery";
  if (t === "delivered") return "Delivered";
  return t;
}
