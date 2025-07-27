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
import type * as functions_documents from "../functions/documents.js";
import type * as functions_orders from "../functions/orders.js";
import type * as functions_services_create from "../functions/services/create.js";
import type * as functions_services_getAll from "../functions/services/getAll.js";
import type * as functions_services_getById from "../functions/services/getById.js";
import type * as functions_services_remove from "../functions/services/remove.js";
import type * as functions_services_update from "../functions/services/update.js";
import type * as functions_services from "../functions/services.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  "functions/documents": typeof functions_documents;
  "functions/orders": typeof functions_orders;
  "functions/services/create": typeof functions_services_create;
  "functions/services/getAll": typeof functions_services_getAll;
  "functions/services/getById": typeof functions_services_getById;
  "functions/services/remove": typeof functions_services_remove;
  "functions/services/update": typeof functions_services_update;
  "functions/services": typeof functions_services;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
