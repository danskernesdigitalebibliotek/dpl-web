import { QueryClient } from "@tanstack/react-query"

import {
  useSearchFacetsQuery,
  useSearchWithPaginationQuery,
} from "@/lib/graphql/generated/fbi/graphql"
import { facetDefinitions } from "@/components/shared/searchFilters/helper"

const prefetchSearchResult = async (q: string, queryClient: QueryClient) => {
  await queryClient.prefetchQuery({
    queryKey: useSearchWithPaginationQuery.getKey({
      q: { all: q },
      offset: 0,
      // TODO: This should be configurable.
      limit: 10,
    }),
    queryFn: useSearchWithPaginationQuery.fetcher({
      q: { all: q },
      offset: 0,
      // TODO: This should be configurable.
      limit: 10,
    }),
  })

  return queryClient
}

const prefetchSearchFacets = async (q: string, queryClient: QueryClient) => {
  await queryClient.prefetchQuery({
    queryKey: useSearchFacetsQuery.getKey({
      q: { all: q },
      facetLimit: 100,
      facets: facetDefinitions,
    }),
    queryFn: useSearchFacetsQuery.fetcher({
      q: { all: q },
      facetLimit: 100,
      facets: facetDefinitions,
    }),
  })

  return queryClient
}

export { prefetchSearchFacets, prefetchSearchResult }
