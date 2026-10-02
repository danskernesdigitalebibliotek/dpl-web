import { FacetState, FilterState, FormView, SortOption } from "./types";

/**
 * Constructs a link into advanced-search-v2 with its URL state pre-filled.
 * Params are written in the formats the app's nuqs parsers read them back in.
 */
export const constructAdvancedSearchUrl = (args: {
  advancedSearchUrl: URL;
  filters?: FilterState[];
  preSearchFacets?: FacetState[];
  facets?: FacetState[];
  onlyExtraTitles?: boolean;
  sort?: SortOption;
  view?: FormView;
}) => {
  const {
    advancedSearchUrl,
    filters,
    preSearchFacets,
    facets,
    ...scalarParameters
  } = args;
  const processedUrl = new URL(advancedSearchUrl);
  const jsonParameters = { filters, preSearchFacets, facets };

  Object.entries(jsonParameters).forEach(([name, value]) => {
    if (value?.length) {
      processedUrl.searchParams.set(name, JSON.stringify(value));
    }
  });
  Object.entries(scalarParameters).forEach(([name, value]) => {
    if (value !== undefined) {
      processedUrl.searchParams.set(name, String(value));
    }
  });

  return processedUrl;
};
