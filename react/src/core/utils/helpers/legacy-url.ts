/**
 * @deprecated Hand-rolled History-API URL writers.
 *
 * New code MUST use `nuqs` (`useQueryState`/`useQueryStates`) for URL query
 * state — see `apps/search-result/SearchResult.tsx` and `useModalUrl` for the
 * established pattern. These helpers write the URL imperatively via
 * `window.history` with plain `URLSearchParams` encoding, which is exactly
 * what nuqs replaces.
 *
 * They live here, isolated from the shared `url.ts`, only to keep the single
 * remaining legacy consumer working: `apps/advanced-search` (v1), which is
 * kept solely for CQL search and is slated for deletion.
 *
 * Delete this module together with advanced-search v1.
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
