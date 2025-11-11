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
import type * as actions_seedPortalData from "../actions/seedPortalData.js";
import type * as assistant from "../assistant.js";
import type * as authz from "../authz.js";
import type * as backfill_documents from "../backfill_documents.js";
import type * as backfill_services from "../backfill_services.js";
import type * as devSeed from "../devSeed.js";
import type * as documentProperties from "../documentProperties.js";
import type * as documents from "../documents.js";
import type * as documentsMaintanance from "../documentsMaintanance.js";
import type * as ensure_users from "../ensure_users.js";
import type * as fineTune from "../fineTune.js";
import type * as intakeDrafts from "../intakeDrafts.js";
import type * as inventoryParts from "../inventoryParts.js";
import type * as invoices from "../invoices.js";
import type * as jobs from "../jobs.js";
import type * as lib_partsNormalize from "../lib/partsNormalize.js";
import type * as lib_search from "../lib/search.js";
import type * as logs from "../logs.js";
import type * as manualQuotes from "../manualQuotes.js";
import type * as mcButtonClicks from "../mcButtonClicks.js";
import type * as mcButtons from "../mcButtons.js";
import type * as mcJourneys from "../mcJourneys.js";
import type * as mcServerPlans from "../mcServerPlans.js";
import type * as mcTimelineEvents from "../mcTimelineEvents.js";
import type * as migration from "../migration.js";
import type * as modelRoute from "../modelRoute.js";
import type * as openai from "../openai.js";
import type * as openaiModels from "../openaiModels.js";
import type * as parts from "../parts.js";
import type * as partsCard from "../partsCard.js";
import type * as propertySchema from "../propertySchema.js";
import type * as qs from "../qs.js";
import type * as scrape_files from "../scrape_files.js";
import type * as seed from "../seed.js";
import type * as services from "../services.js";
import type * as services_import from "../services_import.js";
import type * as template from "../template.js";
import type * as tokens_markUsed from "../tokens/markUsed.js";
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
  "actions/seedPortalData": typeof actions_seedPortalData;
  assistant: typeof assistant;
  authz: typeof authz;
  backfill_documents: typeof backfill_documents;
  backfill_services: typeof backfill_services;
  devSeed: typeof devSeed;
  documentProperties: typeof documentProperties;
  documents: typeof documents;
  documentsMaintanance: typeof documentsMaintanance;
  ensure_users: typeof ensure_users;
  fineTune: typeof fineTune;
  intakeDrafts: typeof intakeDrafts;
  inventoryParts: typeof inventoryParts;
  invoices: typeof invoices;
  jobs: typeof jobs;
  "lib/partsNormalize": typeof lib_partsNormalize;
  "lib/search": typeof lib_search;
  logs: typeof logs;
  manualQuotes: typeof manualQuotes;
  mcButtonClicks: typeof mcButtonClicks;
  mcButtons: typeof mcButtons;
  mcJourneys: typeof mcJourneys;
  mcServerPlans: typeof mcServerPlans;
  mcTimelineEvents: typeof mcTimelineEvents;
  migration: typeof migration;
  modelRoute: typeof modelRoute;
  openai: typeof openai;
  openaiModels: typeof openaiModels;
  parts: typeof parts;
  partsCard: typeof partsCard;
  propertySchema: typeof propertySchema;
  qs: typeof qs;
  scrape_files: typeof scrape_files;
  seed: typeof seed;
  services: typeof services;
  services_import: typeof services_import;
  template: typeof template;
  "tokens/markUsed": typeof tokens_markUsed;
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
