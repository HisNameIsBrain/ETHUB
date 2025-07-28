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
import type * as functions_documents_createDocument from "../functions/documents/createDocument.js";
import type * as functions_documents_getAll from "../functions/documents/getAll.js";
import type * as functions_documents_getDocumentById from "../functions/documents/getDocumentById.js";
import type * as functions_documents_index from "../functions/documents/index.js";
import type * as functions_documents_removeDocument from "../functions/documents/removeDocument.js";
import type * as functions_documents_updateDocument from "../functions/documents/updateDocument.js";
import type * as functions_services_createService from "../functions/services/createService.js";
import type * as functions_services_getAll from "../functions/services/getAll.js";
import type * as functions_services_getServiceById from "../functions/services/getServiceById.js";
import type * as functions_services_removeService from "../functions/services/removeService.js";
import type * as functions_services_services from "../functions/services/services.js";
import type * as functions_services_updateService from "../functions/services/updateService.js";
import type * as orders from "../orders.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  "functions/documents/createDocument": typeof functions_documents_createDocument;
  "functions/documents/getAll": typeof functions_documents_getAll;
  "functions/documents/getDocumentById": typeof functions_documents_getDocumentById;
  "functions/documents/index": typeof functions_documents_index;
  "functions/documents/removeDocument": typeof functions_documents_removeDocument;
  "functions/documents/updateDocument": typeof functions_documents_updateDocument;
  "functions/services/createService": typeof functions_services_createService;
  "functions/services/getAll": typeof functions_services_getAll;
  "functions/services/getServiceById": typeof functions_services_getServiceById;
  "functions/services/removeService": typeof functions_services_removeService;
  "functions/services/services": typeof functions_services_services;
  "functions/services/updateService": typeof functions_services_updateService;
  orders: typeof orders;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
