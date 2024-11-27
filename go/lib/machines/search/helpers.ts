import goConfig from "@/lib/config/goConfig"

import { TContext, TFilters } from "./types"

// Filters needs to be translated tho the input filters expected by the API
// For some reason the input filters are different from the filters coming from the search facets request.
export const getFiltersForSearchRequest = ({ selectedFilters }: TContext): TFilters => {
  const facets = goConfig("search.facets")
  return Object.keys(selectedFilters).reduce((acc, key: string) => {
    const facetConfig = facets[key.toUpperCase() as keyof typeof facets]
    acc = {
      ...acc,
      [facetConfig.filter]: selectedFilters[key as keyof TContext["selectedFilters"]],
    }

    return acc
  }, {} as TFilters)
}
