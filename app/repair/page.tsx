"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import AssistantLauncher from "@/components/AssistantLauncher";

export default function RepairPage() {
  const [lastAssistantText, setLastAssistantText] = useState<string>("");

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Client Portal</h1>
      <p className="text-sm text-muted-foreground">
        Track your repair status, invoices, and communications here.
      </p>

      <Card className="p-4">
        <h2 className="font-medium text-lg mb-2">Repairs</h2>
        {lastAssistantText ? (
          <pre className="mt-2 text-xs bg-gray-100 p-2 rounded">
            {lastAssistantText}
          </pre>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">
            Start a conversation with the assistant to generate repair info.
          </p>
        )}
      </Card>

      <Card className="p-4">
        <h2 className="font-medium text-lg mb-2">Invoices</h2>
        <p className="text-sm text-muted-foreground">
          View and download invoices for completed services.
        </p>
      </Card>

      <AssistantLauncher
        onAssistantMessage={(message: string) => setLastAssistantText(message)}
      />
    </div>
  );
}
