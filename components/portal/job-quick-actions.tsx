"use client";
import { useState } from "react";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function JobQuickActions({ jobId }: { jobId: string }) {
  const setStatus = useMutation(api.jobs.updateStatus);
  const addEvent = useMutation(api.jobs.addEvent);
  const issueLink = useMutation(api.jobs.issuePublicLink);
  const [link, setLink] = useState<string | null>(null);

  return (
    <Card className="p-3 flex flex-wrap gap-2">
      <Button onClick={() => setStatus({ jobId, status: "diagnosis" })}>Diagnosis</Button>
      <Button onClick={() => setStatus({ jobId, status: "awaiting_parts" })}>Awaiting Parts</Button>
      <Button onClick={() => setStatus({ jobId, status: "repair" })}>Repair</Button>
      <Button onClick={() => setStatus({ jobId, status: "qa" })}>QA</Button>
      <Button onClick={() => setStatus({ jobId, status: "ready" })}>Ready</Button>
      <Button onClick={() => setStatus({ jobId, status: "delivered" })}>Delivered</Button>
      <Button variant="outline" onClick={async () => {
        const res = await issueLink({ jobId: jobId as any, ttlMinutes: 4320 }); // 3 days
        const url = `${window.location.origin}/portal/${res.orderNumber}?token=${res.token}`;
        setLink(url);
      }}>Generate Client Link</Button>
      {link ? <div className="w-full text-xs break-all opacity-80">{link}</div> : null}
      <Button variant="secondary" onClick={() => addEvent({ jobId: jobId as any, type: "note", message: "Update posted" })}>Add Note</Button>
    </Card>
  );
}
