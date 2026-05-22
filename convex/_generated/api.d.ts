/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as analytics from "../analytics.js";
import type * as auth from "../auth.js";
import type * as calendarEvents from "../calendarEvents.js";
import type * as engine from "../engine.js";
import type * as habits from "../habits.js";
import type * as http from "../http.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_projects from "../lib/projects.js";
import type * as lib_time from "../lib/time.js";
import type * as lib_workCategory from "../lib/workCategory.js";
import type * as projectLinks from "../projectLinks.js";
import type * as projectNotes from "../projectNotes.js";
import type * as projectSnippets from "../projectSnippets.js";
import type * as projects from "../projects.js";
import type * as tasks from "../tasks.js";
import type * as userPreferences from "../userPreferences.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  analytics: typeof analytics;
  auth: typeof auth;
  calendarEvents: typeof calendarEvents;
  engine: typeof engine;
  habits: typeof habits;
  http: typeof http;
  "lib/auth": typeof lib_auth;
  "lib/projects": typeof lib_projects;
  "lib/time": typeof lib_time;
  "lib/workCategory": typeof lib_workCategory;
  projectLinks: typeof projectLinks;
  projectNotes: typeof projectNotes;
  projectSnippets: typeof projectSnippets;
  projects: typeof projects;
  tasks: typeof tasks;
  userPreferences: typeof userPreferences;
  users: typeof users;
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
