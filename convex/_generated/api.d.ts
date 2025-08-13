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
import type * as documents from "../documents.js";
import type * as ensure_user from "../ensure-user.js";
import type * as services from "../services.js";
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
  documents: typeof documents;
  "ensure-user": typeof ensure_user;
  services: typeof services;
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
