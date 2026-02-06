import { QueryClient } from "@tanstack/react-query"
import { fromPromise } from "xstate"

import { getFacetMachineNames } from "@/components/shared/searchFilters/helper"
import {
  SearchFacetsQuery,
  SearchWithPaginationQuery,
  useSearchFacetsQuery,
  useSearchWithPaginationQuery,
} from "@/lib/graphql/generated/fbi/graphql"

import { TChildrenOrAdultsOption, TFilters } from "./types"

const filtersHardcoded = {
  childrenOrAdults: ["til børn"] as TChildrenOrAdultsOption[],
  materialTypesSpecific: ["bog", "e-bog", "lydbog (online)", "podcast"],
}

export const performSearch = fromPromise(
  ({
    input: { q, filters, offset, limit, queryClient },
  }: {
    input: { q: string; offset: number; limit: number; filters: TFilters; queryClient: QueryClient }
  }): Promise<SearchWithPaginationQuery> => {
    const args = {
      q: { all: q },
      offset: offset,
      limit,
      filters: { ...filters, ...filtersHardcoded },
    }

    return queryClient.fetchQuery({
      queryKey: useSearchWithPaginationQuery.getKey(args),
      queryFn: useSearchWithPaginationQuery.fetcher(args),
    })
  }
)

export const getFacets = fromPromise(
  ({
    input: { q, queryClient, filters, facetLimit },
  }: {
    input: { q: string; facetLimit: number; filters: TFilters; queryClient: QueryClient }
  }): Promise<SearchFacetsQuery> => {
    const args = {
      q: { all: q },
      facets: getFacetMachineNames(),
      facetLimit,
      filters: { ...filters, ...filtersHardcoded },
    }

    return queryClient.fetchQuery({
      queryKey: useSearchFacetsQuery.getKey(args),
      queryFn: useSearchFacetsQuery.fetcher(args),
    })
  }
)
