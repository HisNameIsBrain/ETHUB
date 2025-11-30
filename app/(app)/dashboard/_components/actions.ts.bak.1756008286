"use server";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { fetchMutation } from "convex/nextjs";

export async function deleteService(id: Id<"services">) {
  await fetchMutation(api.services.remove, { id });
  return { ok: true };
}
