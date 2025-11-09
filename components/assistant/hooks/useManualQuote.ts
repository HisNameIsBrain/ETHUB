// components/assistant/hooks/useManualQuote.ts
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function useManualQuote({ invoiceId, jobId }: { invoiceId?: string; jobId?: string }) {
  const list = useQuery(api.manualQuotes.getForTarget, { invoiceId, jobId }) ?? [];
  const request = useMutation(api.manualQuotes.request);
  const decline = useMutation(api.manualQuotes.decline);

  async function sendRequest(intakeSnapshot: any, createdByUserId?: string) {
    await request({ invoiceId, jobId, intakeSnapshot, createdByUserId });
  }
  async function declineRequest(requestId: string) {
    await decline({ requestId });
  }
  return { list, sendRequest, declineRequest };
}
