/**
 * @deprecated Hand-rolled History-API URL writers.
 *
 * New code MUST use `nuqs` (`useQueryState`/`useQueryStates`) for URL query
 * state — see `apps/search-result/SearchResult.tsx` and `useModalUrl` for the
 * established pattern. These helpers write the URL imperatively via
 * `window.history` and hand-encode reserved characters, which is exactly what
 * nuqs replaces.
 *
 * They live here, isolated from the shared `url.ts`, only to keep the two
 * remaining legacy consumers working:
 *   - `apps/advanced-search` (v1) — kept for CQL search.
 *   - `apps/search-result/useFilterHandler.tsx` — legacy sentinel filter scheme.
 *
 * Delete this module once those two are retired.
 */
import { getCurrentLocation } from "./url";

// Restore the human-readable colon (a legal query character) in URLs written
// to the address bar. Display-only: ":" and "%3A" parse identically, and a
// literal "%3A" in a value serialises as "%253A" so it is never matched.
// See docs ADR-013.
export const prettifyQueryColons = (url: URL): string =>
  `${url.origin}${url.pathname}${url.search.replace(/%3A/gi, ":")}${url.hash}`;

export const setQueryParametersInUrl = (parameters: {
  [key: string]: string;
}) => {
  const processedUrl = new URL(getCurrentLocation());
  Object.keys(parameters).forEach((key) => {
    processedUrl.searchParams.set(key, parameters[key]);
  });

  window.history.replaceState(null, "", prettifyQueryColons(processedUrl));
};

const replaceCurrentLocation = (replacementUrl: URL) => {
  window.history.replaceState(null, "", prettifyQueryColons(replacementUrl));
};

export const removeQueryParametersFromUrl = (parameter: string) => {
  const processedUrl = new URL(getCurrentLocation());
  processedUrl.searchParams.delete(parameter);
  replaceCurrentLocation(processedUrl);
};
