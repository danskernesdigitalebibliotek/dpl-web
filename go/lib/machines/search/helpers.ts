import { ReadonlyURLSearchParams } from "next/navigation"

import { getFacetMachineNames } from "@/components/shared/searchFilters/helper"
import goConfig from "@/lib/config/goConfig"
import { SearchFacetsQuery } from "@/lib/graphql/generated/fbi/graphql"

import { TContext, TFilters } from "./types"

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

// Filters needs to be translated tho the input filters expected by the API
// For some reason the input filters are different from the filters coming from the search facets request.
export const correctFacetNames = (facets: SearchFacetsQuery["search"]["facets"]) => {
  const facetsConfig = goConfig("search.facets")
  type TFacetConfigKey = keyof typeof facetsConfig

  return facets.map(({ name, ...rest }) => {
    const configKey = (name as TFacetConfigKey).toUpperCase()
    const filterName = facetsConfig[configKey as TFacetConfigKey].filter
    return {
      ...rest,
      name: filterName,
    }
  })
}

export const transformSearchParamsIntoFilters = (searchParams: ReadonlyURLSearchParams) => {
  const facets = goConfig("search.facets")
  const facetsMachineNames = getFacetMachineNames()

  return facetsMachineNames.reduce(
    (acc: TFilters, machineName) => {
      const values = searchParams.getAll(facets[machineName as keyof typeof facets].filter)
      if (values.length > 0) {
        return {
          ...acc,
          [facets[machineName as keyof typeof facets].filter]: [...values],
        }
      }
      return acc
    },
    {} as { [key: string]: keyof TFilters[] }
  )
}
