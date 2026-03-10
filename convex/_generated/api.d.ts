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
import type * as agents from "../agents.js";
import type * as claims from "../claims.js";
import type * as companies from "../companies.js";
import type * as companyEdits from "../companyEdits.js";
import type * as companyMembers from "../companyMembers.js";
import type * as earlyAccess from "../earlyAccess.js";
import type * as gcc from "../gcc.js";
import type * as gccProfiles from "../gccProfiles.js";
import type * as http from "../http.js";
import type * as lib_auth from "../lib/auth.js";
import type * as notifications from "../notifications.js";
import type * as shortlists from "../shortlists.js";
import type * as storage from "../storage.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  agents: typeof agents;
  claims: typeof claims;
  companies: typeof companies;
  companyEdits: typeof companyEdits;
  companyMembers: typeof companyMembers;
  earlyAccess: typeof earlyAccess;
  gcc: typeof gcc;
  gccProfiles: typeof gccProfiles;
  http: typeof http;
  "lib/auth": typeof lib_auth;
  notifications: typeof notifications;
  shortlists: typeof shortlists;
  storage: typeof storage;
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
