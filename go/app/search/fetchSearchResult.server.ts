import { QueryClient } from "@tanstack/react-query"

import { facetDefinitions } from "@/components/shared/searchFilters/helper"
import {
  useSearchFacetsQuery,
  useSearchWithPaginationQuery,
} from "@/lib/graphql/generated/fbi/graphql"

const prefetchSearchResult = async (q: string, queryClient: QueryClient) => {
  await queryClient.prefetchQuery({
    queryKey: useSearchWithPaginationQuery.getKey({
      q: { all: q },
      offset: 0,
      // TODO: This should match the query on search page and be configurable.
      limit: 9,
    }),
    queryFn: useSearchWithPaginationQuery.fetcher({
      q: { all: q },
      offset: 0,
      // TODO: This should match the query on search page and be configurable.
      limit: 9,
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
