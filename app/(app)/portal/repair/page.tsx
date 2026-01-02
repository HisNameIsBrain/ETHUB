"use client";

import { Card } from "@/components/ui/card";
import AssistantLauncher from "@/components/assistant-launcher";
import { useState } from "react";
import AssistantInvoiceControls from "@/components/AssistantInvoiceControls";

export default function RepairPage() {
  const [assistantText, setAssistantText] = useState("");

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Repair Portal</h1>

      <Card className="p-4">
        <h2 className="font-medium text-lg mb-2">Current Device Repair</h2>
        {assistantText ? (
          <pre className="mt-2 text-xs bg-gray-100 p-2 rounded">{assistantText}</pre>
        ) : (
          <p className="text-sm text-muted-foreground">
            Enter device details in the assistant to generate repair info.
          </p>
        )}
      </Card>

      <Card className="p-4">
        <h2 className="font-medium text-lg mb-2">Invoices</h2>
        <AssistantInvoiceControls />
      </Card>

      <AssistantLauncher onAssistantMessage={setAssistantText} />
    </div>
  );
}
