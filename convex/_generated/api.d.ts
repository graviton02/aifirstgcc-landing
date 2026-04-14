/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin from "../admin.js";
import type * as adminNotifications from "../adminNotifications.js";
import type * as agents from "../agents.js";
import type * as aiPulse from "../aiPulse.js";
import type * as claims from "../claims.js";
import type * as companies from "../companies.js";
import type * as companyEdits from "../companyEdits.js";
import type * as companyMembers from "../companyMembers.js";
import type * as companySubmissions from "../companySubmissions.js";
import type * as crons from "../crons.js";
import type * as earlyAccess from "../earlyAccess.js";
import type * as emails_claimApproved from "../emails/claimApproved.js";
import type * as emails_contactRequest from "../emails/contactRequest.js";
import type * as emails_notification from "../emails/notification.js";
import type * as gcc from "../gcc.js";
import type * as gccProfiles from "../gccProfiles.js";
import type * as http from "../http.js";
import type * as jobApplications from "../jobApplications.js";
import type * as jobProfiles from "../jobProfiles.js";
import type * as jobs from "../jobs.js";
import type * as lib_admin from "../lib/admin.js";
import type * as lib_agentDirectoryCards from "../lib/agentDirectoryCards.js";
import type * as lib_agentSearch from "../lib/agentSearch.js";
import type * as lib_agentTaxonomy from "../lib/agentTaxonomy.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_companyLogos from "../lib/companyLogos.js";
import type * as lib_directoryStats from "../lib/directoryStats.js";
import type * as lib_errors from "../lib/errors.js";
import type * as lib_personas from "../lib/personas.js";
import type * as lib_providerRequests from "../lib/providerRequests.js";
import type * as notifications from "../notifications.js";
import type * as providerProfiles from "../providerProfiles.js";
import type * as providerRequests from "../providerRequests.js";
import type * as reviews from "../reviews.js";
import type * as shortlists from "../shortlists.js";
import type * as storage from "../storage.js";
import type * as viewer from "../viewer.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  adminNotifications: typeof adminNotifications;
  agents: typeof agents;
  aiPulse: typeof aiPulse;
  claims: typeof claims;
  companies: typeof companies;
  companyEdits: typeof companyEdits;
  companyMembers: typeof companyMembers;
  companySubmissions: typeof companySubmissions;
  crons: typeof crons;
  earlyAccess: typeof earlyAccess;
  "emails/claimApproved": typeof emails_claimApproved;
  "emails/contactRequest": typeof emails_contactRequest;
  "emails/notification": typeof emails_notification;
  gcc: typeof gcc;
  gccProfiles: typeof gccProfiles;
  http: typeof http;
  jobApplications: typeof jobApplications;
  jobProfiles: typeof jobProfiles;
  jobs: typeof jobs;
  "lib/admin": typeof lib_admin;
  "lib/agentDirectoryCards": typeof lib_agentDirectoryCards;
  "lib/agentSearch": typeof lib_agentSearch;
  "lib/agentTaxonomy": typeof lib_agentTaxonomy;
  "lib/auth": typeof lib_auth;
  "lib/companyLogos": typeof lib_companyLogos;
  "lib/directoryStats": typeof lib_directoryStats;
  "lib/errors": typeof lib_errors;
  "lib/personas": typeof lib_personas;
  "lib/providerRequests": typeof lib_providerRequests;
  notifications: typeof notifications;
  providerProfiles: typeof providerProfiles;
  providerRequests: typeof providerRequests;
  reviews: typeof reviews;
  shortlists: typeof shortlists;
  storage: typeof storage;
  viewer: typeof viewer;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
