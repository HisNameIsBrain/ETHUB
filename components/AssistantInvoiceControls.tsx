"use client";

import React from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

type RecordMap = Record<string, string>;

function formatInvoice(record: RecordMap) {
  return [
    `--- ETHUB Repair Intake / Invoice ---`,
    `ID: ${record.ID ?? "IC-38"}`,
    `Service Status: ${record["Service Status"] ?? "Received"}`,
    `Name: ${record.Name ?? ""}`,
    `Number: ${record.Number ?? ""}`,
    `Description: ${record.Description ?? ""}`,
    `Manufacturer: ${record.Manufacturer ?? ""}`,
    `#Quote: ${record["#Quote"] ?? "TBA"}`,
    `# Deposit: ${record["# Deposit"] ?? "TBA"}`,
    `Service: ${record.Service ?? ""}`,
    `#Fulfillment: ${record["#Fulfillment"] ?? "TBA"}`,
    `∑ Trend: ${record["∑ Trend"] ?? ""}`,
    `Due: ${record.Due ?? "TBA"}`,
    `∑ Balance: ${record["∑ Balance"] ?? ""}`,
    `Warranty: ${record.Warranty ?? "Customer to sign 30-day warranty & Liability Acknowledgement."}`,
    `Diagnosis: ${record.Diagnosis ?? ""}`,
    ``,
    `Customer signature: ____________________________    Date: ___________`,
    `Technician signature: __________________________ Date: ___________`,
  ].join("\n");
}

function downloadFile(filename: string, contents: string) {
  const blob = new Blob([contents], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function parseAssistantBlock(block: string): RecordMap {
  const lines = block.split(/\r?\n/).map((l) => l.trim());
  const record: RecordMap = {};
  for (const line of lines) {
    if (!line) continue;
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const val = line.slice(idx + 1).trim();
    if (key) record[key] = val;
  }
  return record;
}

function readQS() {
  if (typeof window === "undefined") return { token: "", ticket: "" };
  const qs = new URLSearchParams(window.location.search);
  return { token: qs.get("token") ?? "", ticket: qs.get("ticket") ?? "" };
}

async function sendInvoiceToPortal(token: string, record: RecordMap) {
  if (!token) throw new Error("Missing access token");
  const payload = {
    ticketId: record.ID ?? record["ID"] ?? null,
    name: record.Name ?? null,
    phone: record.Number ?? null,
    manufacturer: record.Manufacturer ?? null,
    description: record.Description ?? null,
    quote: record["#Quote"] ?? null,
    deposit: record["# Deposit"] ?? null,
    service: record.Service ?? null,
    due: record.Due ?? null,
    warrantyAcknowledged: !!record.Warranty,
    raw: record,
  };

  const res = await fetch("/api/portal/invoices", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Portal error: ${res.status} ${text}`);
  }
  return res.json();
}

export default function AssistantInvoiceControls({ lastAssistantText }: { lastAssistantText: string }) {
  const [busy, setBusy] = React.useState(false);
  const { token, ticket } = React.useMemo(() => readQS(), []);
  const parsed = React.useMemo(() => parseAssistantBlock(lastAssistantText || ""), [lastAssistantText]);

  return (
    <div className="flex gap-2 items-center">
      <Button
        size="sm"
        variant="ghost"
        onClick={() => {
          const invoice = formatInvoice(parsed);
          downloadFile(`ETHUB-invoice-${parsed.ID || ticket || "TBA"}.txt`, invoice);
        }}
      >
        <Download className="mr-2 h-4 w-4" /> Export invoice
      </Button>

      <Button
        size="sm"
        variant="outline"
        disabled={busy || !token}
        onClick={async () => {
          setBusy(true);
          try {
            await sendInvoiceToPortal(token, parsed);
            alert("Invoice sent to portal successfully.");
          } catch (err) {
            console.error(err);
            alert("Failed to send invoice to portal.");
          } finally {
            setBusy(false);
          }
        }}
      >
        Send to Portal
      </Button>
    </div>
  );
}
