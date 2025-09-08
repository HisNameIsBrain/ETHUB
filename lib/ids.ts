import type { Id } from "@/convex/_generated/dataModel";

/** Cast a string to a Convex service Id */
export function asServiceId(id: string): Id<"services"> {
  return id as unknown as Id<"services">;
}

/** (Optional) other Id helpers if you need them later */
export function asDocumentId(id: string): Id<"documents"> {
  return id as unknown as Id<"documents">;
}
