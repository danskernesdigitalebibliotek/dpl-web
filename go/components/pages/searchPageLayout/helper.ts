import { ReadonlyURLSearchParams } from "next/navigation"

import goConfig from "@/lib/config/config"
import { FacetFieldEnum, SearchFiltersInput } from "@/lib/graphql/generated/fbi/graphql"

export const getSearchQueryArguments = ({
  q,
  currentPage,
  facetFilters,
}: {
  q: string
  currentPage: number
  facetFilters: SearchFiltersInput
}) => {
  const limit = goConfig<number>("search.item.limit")
  return {
    q: { all: q },
    offset: currentPage * limit,
    limit: limit,
    filters: {
      branchId: goConfig<`${number}`[]>("search.branch.ids"),
      ...facetFilters,
    },
  }
}

export const getFacetsForSearchRequest = ({
  facetDefinitions,
  searchParams,
  mapFacetsToFilters,
}: {
  facetDefinitions: FacetFieldEnum[]
  searchParams: ReadonlyURLSearchParams
  mapFacetsToFilters: Record<FacetFieldEnum, keyof SearchFiltersInput>
}) => {
  return facetDefinitions.reduce(
    (acc: SearchFiltersInput, facetDefinition) => {
      const values = searchParams.getAll(facetDefinition)
      if (values.length > 0) {
        return {
          ...acc,
          [mapFacetsToFilters[facetDefinition]]: [...values],
        }
      }
      return acc
    },
    {} as { [key: string]: keyof SearchFiltersInput[] }
  )
}
