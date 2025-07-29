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
import type * as documents_createDocument from "../documents/createDocument.js";
import type * as documents_document from "../documents/document.js";
import type * as documents_getAll from "../documents/getAll.js";
import type * as documents_getDocumentById from "../documents/getDocumentById.js";
import type * as documents_index from "../documents/index.js";
import type * as documents_removeDocument from "../documents/removeDocument.js";
import type * as documents_updateDocument from "../documents/updateDocument.js";
import type * as services_createService from "../services/createService.js";
import type * as services_getAll from "../services/getAll.js";
import type * as services_getServiceById from "../services/getServiceById.js";
import type * as services_index from "../services/index.js";
import type * as services_removeService from "../services/removeService.js";
import type * as services_services from "../services/services.js";
import type * as services_updateService from "../services/updateService.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  "documents/createDocument": typeof documents_createDocument;
  "documents/document": typeof documents_document;
  "documents/getAll": typeof documents_getAll;
  "documents/getDocumentById": typeof documents_getDocumentById;
  "documents/index": typeof documents_index;
  "documents/removeDocument": typeof documents_removeDocument;
  "documents/updateDocument": typeof documents_updateDocument;
  "services/createService": typeof services_createService;
  "services/getAll": typeof services_getAll;
  "services/getServiceById": typeof services_getServiceById;
  "services/index": typeof services_index;
  "services/removeService": typeof services_removeService;
  "services/services": typeof services_services;
  "services/updateService": typeof services_updateService;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
