import { QueryClient } from "@tanstack/react-query"
import { ReadonlyURLSearchParams } from "next/navigation"
import { fromPromise } from "xstate"

import { getFacetsForSearchRequest } from "@/components/pages/searchPageLayout/helper"
import { getFacetMachineNames } from "@/components/shared/searchFilters/helper"
import goConfig from "@/lib/config/config"
import {
  SearchFacetsQuery,
  SearchFiltersInput,
  SearchWithPaginationQuery,
  useSearchFacetsQuery,
  useSearchWithPaginationQuery,
} from "@/lib/graphql/generated/fbi/graphql"

export const performSearch = fromPromise(
  ({
    input: { q, filters, offset, queryClient },
  }: {
    input: { q: string; offset: number; filters: SearchFiltersInput; queryClient: QueryClient }
  }): Promise<SearchWithPaginationQuery> => {
    const args = {
      q: { all: q },
      offset: offset,
      limit: goConfig<number>("search.item.limit"),
      filters
  }

    return queryClient.fetchQuery({
      queryKey: useSearchWithPaginationQuery.getKey(args),
      queryFn: useSearchWithPaginationQuery.fetcher(args),
    })
  }
)

export const getFacets = fromPromise(
  ({
    input: { q, queryClient, filters },
  }: {
    input: { q: string; filters: SearchFiltersInput; queryClient: QueryClient }
  }): Promise<SearchFacetsQuery> => {
    const searchParams = new URLSearchParams(window.location.search);
    const args = {
      q: { all: q },
      facets: getFacetMachineNames(),
      facetLimit: <number>goConfig("search.facet.limit"),
      filters
    }

    return queryClient.fetchQuery({
      queryKey: useSearchFacetsQuery.getKey(args),
      queryFn: useSearchFacetsQuery.fetcher(args),
    })
  }
)
