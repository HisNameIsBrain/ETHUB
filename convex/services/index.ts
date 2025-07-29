import { query, mutation } from "@/convex/_generated/server";
import { v } from "convex/values";
import type { QueryCtx, MutationCtx } from "convex/server";

// convex/functions/services/index.ts
export * from "./getAll";
export * from "./getServiceById";
export * from "./createService";
export * from "./updateService";
export * from "./removeService";