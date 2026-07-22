/**
 * @deprecated Hand-rolled History-API URL writers.
 *
 * New code MUST use `nuqs` (`useQueryState`/`useQueryStates`) for URL query
 * state — see `apps/search-result/SearchResult.tsx` and `useModalUrl` for the
 * established pattern. These helpers write the URL imperatively via
 * `window.history` with plain `URLSearchParams` encoding, which is exactly
 * what nuqs replaces.
 *
 * They live here, isolated from the shared `url.ts`, only to keep the two
 * remaining legacy consumers working:
 *   - `apps/advanced-search` (v1) — kept for CQL search.
 *   - `apps/search-result/useFilterHandler.tsx` — legacy sentinel filter scheme.
 *
 * Delete this module once those two are retired.
 */
import { getCurrentLocation } from "./url";

export const setQueryParametersInUrl = (parameters: {
  [key: string]: string;
}) => {
  const processedUrl = new URL(getCurrentLocation());
  Object.keys(parameters).forEach((key) => {
    processedUrl.searchParams.set(key, parameters[key]);
  });

  window.history.replaceState(null, "", String(processedUrl));
};

export const removeQueryParametersFromUrl = (parameter: string) => {
  const processedUrl = new URL(getCurrentLocation());
  processedUrl.searchParams.delete(parameter);
  window.history.replaceState(null, "", String(processedUrl));
};
