/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as account from "../account.js";
import type * as boardShares from "../boardShares.js";
import type * as dashboard from "../dashboard.js";
import type * as files from "../files.js";
import type * as items from "../items.js";
import type * as messages from "../messages.js";
import type * as notifications from "../notifications.js";
import type * as profiles from "../profiles.js";
import type * as projects from "../projects.js";
import type * as publicShares from "../publicShares.js";
import type * as referrals from "../referrals.js";
import type * as resend from "../resend.js";
import type * as tags from "../tags.js";
import type * as teams from "../teams.js";
import type * as usage from "../usage.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  account: typeof account;
  boardShares: typeof boardShares;
  dashboard: typeof dashboard;
  files: typeof files;
  items: typeof items;
  messages: typeof messages;
  notifications: typeof notifications;
  profiles: typeof profiles;
  projects: typeof projects;
  publicShares: typeof publicShares;
  referrals: typeof referrals;
  resend: typeof resend;
  tags: typeof tags;
  teams: typeof teams;
  usage: typeof usage;
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
