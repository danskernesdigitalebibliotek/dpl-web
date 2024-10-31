import { QueryClient } from "@tanstack/react-query"

import { facetDefinitions } from "@/components/shared/searchFilters/helper"
import goConfig from "@/lib/config/config"
import {
  useSearchFacetsQuery,
  useSearchWithPaginationQuery,
} from "@/lib/graphql/generated/fbi/graphql"

const prefetchSearchResult = async (q: string, queryClient: QueryClient) => {
  await queryClient.prefetchQuery({
    queryKey: useSearchWithPaginationQuery.getKey({
      q: { all: q },
      offset: goConfig("search.offset.initial"),
      // TODO: This should match the query on search page and be configurable.
      limit: goConfig("search.item.limit"),
    }),
    queryFn: useSearchWithPaginationQuery.fetcher({
      q: { all: q },
      offset: goConfig("search.offset.initial"),
      // TODO: This should match the query on search page and be configurable.
      limit: goConfig("search.item.limit"),
    }),
  })

  return queryClient
}

const prefetchSearchFacets = async (q: string, queryClient: QueryClient) => {
  await queryClient.prefetchQuery({
    queryKey: useSearchFacetsQuery.getKey({
      q: { all: q },
      facetLimit: goConfig("search.facet.limit"),
      facets: facetDefinitions,
    }),
    queryFn: useSearchFacetsQuery.fetcher({
      q: { all: q },
      facetLimit: goConfig("search.facet.limit"),
      facets: facetDefinitions,
    }),
  })

  return queryClient
}

export { prefetchSearchFacets, prefetchSearchResult }
