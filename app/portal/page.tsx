"use client";

import { Card } from "@/components/ui/card";

export default function PortalPage() {
  return (
    <div className="max-w-5xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Client Portal</h1>
      <p className="text-sm text-muted-foreground">
        Track your repair status, invoices, and communications here.
      </p>

      <Card className="p-4">
        <h2 className="font-medium text-lg mb-2">Repairs</h2>
        <p className="text-sm text-muted-foreground">
          You’ll see your device progress here once linked to your account.
        </p>
      </Card>

      <Card className="p-4">
        <h2 className="font-medium text-lg mb-2">Invoices</h2>
        <p className="text-sm text-muted-foreground">
          View and download invoices for completed services.
        </p>
      </Card>
    </div>
  );
}
