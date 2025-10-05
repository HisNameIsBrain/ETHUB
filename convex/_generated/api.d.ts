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
import type * as _utils_auth from "../_utils/auth.js";
import type * as assistant from "../assistant.js";
import type * as authz from "../authz.js";
import type * as backfill_documents from "../backfill_documents.js";
import type * as backfill_services from "../backfill_services.js";
import type * as documents from "../documents.js";
import type * as ensure_users from "../ensure_users.js";
import type * as fineTune from "../fineTune.js";
import type * as jobs from "../jobs.js";
import type * as lib_search from "../lib/search.js";
import type * as logs from "../logs.js";
import type * as migration from "../migration.js";
import type * as modelRoute from "../modelRoute.js";
import type * as openai from "../openai.js";
import type * as openaiModels from "../openaiModels.js";
import type * as qs from "../qs.js";
import type * as scrape_files from "../scrape_files.js";
import type * as scrape_iosfiles from "../scrape_iosfiles.js";
import type * as services from "../services.js";
import type * as services_import from "../services_import.js";
import type * as tools_backfill_documents from "../tools/backfill_documents.js";
import type * as users from "../users.js";
import type * as voice from "../voice.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  "_utils/auth": typeof _utils_auth;
  assistant: typeof assistant;
  authz: typeof authz;
  backfill_documents: typeof backfill_documents;
  backfill_services: typeof backfill_services;
  documents: typeof documents;
  ensure_users: typeof ensure_users;
  fineTune: typeof fineTune;
  jobs: typeof jobs;
  "lib/search": typeof lib_search;
  logs: typeof logs;
  migration: typeof migration;
  modelRoute: typeof modelRoute;
  openai: typeof openai;
  openaiModels: typeof openaiModels;
  qs: typeof qs;
  scrape_files: typeof scrape_files;
  scrape_iosfiles: typeof scrape_iosfiles;
  services: typeof services;
  services_import: typeof services_import;
  "tools/backfill_documents": typeof tools_backfill_documents;
  users: typeof users;
  voice: typeof voice;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
