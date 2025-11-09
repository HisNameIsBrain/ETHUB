import React from "react";
import { Button } from "@/components/ui/button";

export function ManualQuoteNotice({
  status, onDecline, onAccept,
}: {
  status: "requested" | "in_review" | "responded";
  onDecline: () => void;
  onAccept: () => void;
}) {
  return (
    <div className="mt-3 rounded-xl border p-3 bg-muted/40 flex items-center justify-between">
      <div className="text-sm">
        {status === "requested" && "Manual quote requested. Awaiting technician review."}
        {status === "in_review" && "Technician is reviewing your request."}
        {status === "responded" && "Technician responded with a manual quote."}
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={onDecline}>Decline</Button>
        <Button onClick={onAccept}>Accept</Button>
      </div>
    </div>
  );
}
