"use client";

import { Card } from "@/components/ui/card";

export default function DocumentsPage() {
  return (
    <div className="max-w-5xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Documents</h1>
      <Card className="p-4">
        <p className="text-sm text-muted-foreground">
          Manage manuals, terms, or uploads shared with clients.
        </p>
      </Card>
    </div>
  );
}
