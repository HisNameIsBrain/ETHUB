// app/dashboard/services/admin/actions.ts
"use server";
import { api } from "@/convex/_generated/api";
import { authAction } from "@/lib/safeAction"; // or however you auth-gate admin ops
import { fetchMutation } from "@/lib/convexHelpers"; // your helper that wraps server-side client

export const runImport = authAction(async () => {
  // actions are called via runAction, not mutation
  const res = await fetchMutation(api.services_import.importFromIosfiles, {});
  return res;
});
