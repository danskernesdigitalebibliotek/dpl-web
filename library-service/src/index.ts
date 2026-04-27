/**
 * Public entry point for the `library-service` package.
 *
 * Each external service / SDK wrapper lives in its own namespace so consumers
 * can tell at a glance which vendor they are talking to, and so adding a new
 * service is a purely additive change here (add a folder under `src/`, then a
 * line below).
 *
 * Usage:
 *   import { wedobooks } from "library-service"
 *   const sdk = wedobooks.createLibraryService(config)
 *   wedobooks.openReader({ sdk, checkout, element })
 */
export * as wedobooks from "./wedobooks"

// Add additional services here as they are introduced, e.g.:
// export * as fbs from "./fbs"
// export * as publizon from "./publizon"
