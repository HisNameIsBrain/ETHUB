import { query, mutation } from "convex/server";
import { v } from "convex/values";
import type { QueryCtx, MutationCtx } from "convex/server";

// convex/functions/documents/index.ts (NEW)
export * from "./getAll";
export * from "./getDocumentById";
export * from "./createDocument";
export * from "./updateDocument";
export * from "./removeDocument";