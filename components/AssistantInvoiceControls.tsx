"use client";
import React from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

type RecordMap = Record<string, string>;

function parseAssistantBlock(block: string): RecordMap {
  const lines = block.split(/\r?\n/).map(l => l.trim());
  const record: Record<string, string> = {};
  for (const line of lines) {
    if (!line) continue;
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    record[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
  }
  return record;
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

export default function AssistantInvoiceControls({ lastAssistantText }: { lastAssistantText: string }) {
  const createInvoice = useMutation ? useMutation("invoices.create") : null;
  const parsed = React.useMemo(() => parseAssistantBlock(lastAssistantText || ""), [lastAssistantText]);

  function formatInvoice(record: RecordMap) {
    return [
      `ID: ${record.ID ?? "IC-38"}`,
      `Name: ${record.Name ?? ""}`,
      `Number: ${record.Number ?? ""}`,
      `Description: ${record.Description ?? ""}`,
      `Manufacturer: ${record.Manufacturer ?? ""}`,
      `#Quote: ${record["#Quote"] ?? "TBA"}`,
    ].join("\n");
  }

  async function saveToPortal() {
    const payload = {
      ticketId: parsed.ID ?? undefined,
      name: parsed.Name ?? null,
      phone: parsed.Number ?? null,
      manufacturer: parsed.Manufacturer ?? null,
      description: parsed.Description ?? null,
      quote: parsed["#Quote"] ?? null,
      deposit: parsed["# Deposit"] ?? "$0.00",
      service: parsed.Service ?? null,
      due: parsed.Due ?? null,
      warrantyAcknowledged: !!parsed.Warranty,
      raw: parsed,
    };
    try {
      if (createInvoice) {
        await createInvoice(payload);
        alert("Saved to portal (Convex).");
      } else {
        const res = await fetch("/api/portal/invoices", {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error("Save failed");
        alert("Saved to portal.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to save invoice.");
    }
  }

  return (
    <div className="flex gap-2">
      <Button variant="ghost" size="sm" onClick={() => downloadFile(`ETHUB-invoice-${parsed.ID ?? "TBA"}.txt`, formatInvoice(parsed))}>
        <Download className="mr-2 h-4 w-4" /> Export invoice
      </Button>
      <Button variant="outline" size="sm" onClick={() => void saveToPortal()}>Save to Portal</Button>
    </div>
  );
}
