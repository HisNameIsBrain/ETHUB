// app/dashboard/_components/actions.ts
import { api } from "@/convex/_generated/api";
import { asServiceId } from "@/lib/ids";
import { fetchMutation } from "convex/nextjs";

export async function removeService(id: string, opts?: { revalidate?: string }) {
  await fetchMutation(api.services.update, { id: asServiceId(id), archived: true });
  if (opts?.revalidate) revalidatePath(opts.revalidate);
}
