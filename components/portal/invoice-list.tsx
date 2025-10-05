// components/portal/InvoicesList.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const mockInvoices = [
  {
    id: "INV-2025-001",
    service: "Screen Replacement - iPhone 14 Pro",
    total: "$249.00",
    date: "2025-09-28",
  },
  {
    id: "INV-2025-002",
    service: "Battery Replacement - MacBook Air M2",
    total: "$199.00",
    date: "2025-09-20",
  },
];

export default function InvoicesList() {
  return (
    <div className="space-y-4">
      {mockInvoices.map((inv) => (
        <Card key={inv.id}>
          <CardHeader>
            <CardTitle>{inv.service}</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">Date: {inv.date}</p>
              <p className="font-medium">{inv.total}</p>
            </div>
            <Button variant="outline" size="sm">
              Download PDF
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
