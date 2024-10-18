import { QueryClient } from "@tanstack/react-query"

import {
  FacetField,
  useSearchFacetsQuery,
  useSearchWithPaginationQuery,
} from "@/lib/graphql/generated/fbi/graphql"

const prefetchSearchResult = async (q: string, queryClient: QueryClient) => {
  await queryClient.prefetchQuery({
    queryKey: useSearchWithPaginationQuery.getKey({
      q: { all: q },
      offset: 0,
      limit: 10,
    }),
    queryFn: useSearchWithPaginationQuery.fetcher({
      q: { all: q },
      offset: 0,
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
      facets: [
        "materialTypesGeneral",
        "mainLanguages",
        "age",
        "lix",
        "subjects",
        "let",
      ] as FacetField[],
    }),
    queryFn: useSearchFacetsQuery.fetcher({
      q: { all: q },
      facetLimit: 100,
      facets: [
        "materialTypesGeneral",
        "mainLanguages",
        "age",
        "lix",
        "subjects",
        "let",
      ] as FacetField[],
    }),
  })

  return queryClient
}

export { prefetchSearchFacets, prefetchSearchResult }
