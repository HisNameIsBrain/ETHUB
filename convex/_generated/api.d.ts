/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as backfill_documents from "../backfill_documents.js";
import type * as backfill_services from "../backfill_services.js";
import type * as convex__generated_api from "../convex/_generated/api.js";
import type * as convex__generated_server from "../convex/_generated/server.js";
import type * as documents from "../documents.js";
import type * as ensure_user from "../ensure_user.js";
import type * as migration from "../migration.js";
import type * as services from "../services.js";
import type * as tools_backfill_documents from "../tools/backfill_documents.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  backfill_documents: typeof backfill_documents;
  backfill_services: typeof backfill_services;
  "convex/_generated/api": typeof convex__generated_api;
  "convex/_generated/server": typeof convex__generated_server;
  documents: typeof documents;
  ensure_user: typeof ensure_user;
  migration: typeof migration;
  services: typeof services;
  "tools/backfill_documents": typeof tools_backfill_documents;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
