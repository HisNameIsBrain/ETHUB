"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Wrench, Package, ShieldCheck, Truck, AlertCircle } from "lucide-react";

const statusLabel: Record<string,string> = {
  received: "Device Received",
  diagnosis: "Diagnosis",
  awaiting_parts: "Awaiting Parts",
  repair: "Repair In Progress",
  qa: "Quality Check",
  ready: "Ready for Pickup/Delivery",
  delivered: "Delivered",
  on_hold: "On Hold"
};

export default function Page({ params }: { params: { orderNumber: string } }) {
  const sp = useSearchParams();
  const token = sp.get("token") ?? "";
  const data = useQuery(api.jobs.getPublic, token ? { orderNumber: params.orderNumber, token } : "skip");
  const [err, setErr] = useState<string|undefined>();
  useEffect(() => { if (!token) setErr("Missing token"); }, [token]);
  if (!token) return <ErrorBox msg="Access token required."/>;
  if (data === undefined) return <Skeleton/>;
  if ((data as any).error) return <ErrorBox msg={(data as any).error}/>;
  const { job, events } = data as any;
  return (
    <div className="mx-auto max-w-3xl p-4 space-y-4">
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="text-xl font-semibold">Order #{job.orderNumber}</div>
          <Badge>{statusLabel[job.status] ?? job.status}</Badge>
        </div>
        <div className="mt-2 text-sm opacity-80">{job.deviceModel}{job.serial ? ` • SN: ${job.serial}` : ""}</div>
        {job.eta ? <div className="mt-1 text-sm">ETA: {new Date(job.eta).toLocaleDateString()}</div> : null}
      </Card>
      <Timeline events={events} />
      <Legend />
    </div>
  );
}

function Skeleton() { return <div className="animate-pulse p-6">Loading…</div>; }
function ErrorBox({msg}:{msg:string}) { return <div className="p-4 text-sm text-red-600 flex items-center gap-2"><AlertCircle className="h-4 w-4"/>{msg}</div>; }

function Legend() {
  return (
    <div className="text-xs opacity-70 p-2">Status updates appear here in real time. Keep this link private. If your link expires, request a new one from support.</div>
  );
}

function Timeline({ events }: { events: any[] }) {
  const ordered = [...events].sort((a,b) => a.createdAt - b.createdAt);
  return (
    <Card className="p-4">
      <div className="font-medium mb-2">Progress</div>
      <div className="space-y-4">
        {ordered.map((e) => (
          <div key={e._id} className="flex items-start gap-3">
            <Icon type={e.type} />
            <div>
              <div className="text-sm">{labelFor(e.type)}</div>
              {e.message ? <div className="text-xs opacity-80">{e.message}</div> : null}
              <div className="text-[11px] opacity-60">{new Date(e.createdAt).toLocaleString()}</div>
              {Array.isArray(e.mediaUrls) && e.mediaUrls.length > 0 ? (
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {e.mediaUrls.map((u:string) => (
                    <img key={u} src={u} alt="update" className="rounded-lg border" />
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function Icon({ type }:{ type:string }){
  if (type.includes("diagnosis")) return <Wrench className="h-4 w-4 mt-0.5"/>;
  if (type.includes("parts")) return <Package className="h-4 w-4 mt-0.5"/>;
  if (type.includes("repair")) return <Wrench className="h-4 w-4 mt-0.5"/>;
  if (type.includes("qa")) return <ShieldCheck className="h-4 w-4 mt-0.5"/>;
  if (type.includes("ready") || type.includes("delivered")) return <Truck className="h-4 w-4 mt-0.5"/>;
  return <CheckCircle2 className="h-4 w-4 mt-0.5"/>;
}

function labelFor(t:string){
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
