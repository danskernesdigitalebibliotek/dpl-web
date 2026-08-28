import { QueryClient } from "@tanstack/react-query"
import { fromPromise } from "xstate"

import { getFacetMachineNames } from "@/components/shared/searchFilters/helper"
import { getSearchBranchIds } from "@/lib/actions/getSearchBranchIds"
import {
  SearchFacetsQuery,
  SearchWithPaginationQuery,
  useSearchFacetsQuery,
  useSearchWithPaginationQuery,
} from "@/lib/graphql/generated/fbi/graphql"

import { TFilters } from "./types"

// Branches whitelisted for search (all branches minus the library's search
// blacklist), resolved by the getSearchBranchIds server action. Static config,
// so cache it for the session. Added to every search/facet query as a branchId
// filter so results are limited to works held at these branches.
const searchBranchIdsQueryOptions = {
  queryKey: ["searchBranchIds"] as const,
  queryFn: () => getSearchBranchIds(),
  staleTime: Infinity,
}

const withBranchFilter = async (queryClient: QueryClient, filters: TFilters): Promise<TFilters> => {
  let branchId: string[] = []
  try {
    branchId = await queryClient.fetchQuery(searchBranchIdsQueryOptions)
  } catch (error) {
    // If the whitelist can't be resolved, fall back to an unfiltered search
    // rather than breaking search entirely — but surface it, since it silently
    // disables branch filtering.
    console.error("Failed to resolve search branch whitelist", error)
  }
  return branchId.length > 0 ? { ...filters, branchId } : { ...filters }
}

export const performSearch = fromPromise(
  async ({
    input: { q, filters, offset, limit, queryClient },
  }: {
    input: { q: string; offset: number; limit: number; filters: TFilters; queryClient: QueryClient }
  }): Promise<SearchWithPaginationQuery> => {
    const args = {
      q: { all: q },
      offset: offset,
      limit,
      filters: await withBranchFilter(queryClient, filters),
    }

    return queryClient.fetchQuery({
      queryKey: useSearchWithPaginationQuery.getKey(args),
      queryFn: useSearchWithPaginationQuery.fetcher(args),
    })
  }
)

export const getFacets = fromPromise(
  async ({
    input: { q, queryClient, filters, facetLimit },
  }: {
    input: { q: string; facetLimit: number; filters: TFilters; queryClient: QueryClient }
  }): Promise<SearchFacetsQuery> => {
    const args = {
      q: { all: q },
      facets: getFacetMachineNames(),
      facetLimit,
      filters: await withBranchFilter(queryClient, filters),
    }

    return queryClient.fetchQuery({
      queryKey: useSearchFacetsQuery.getKey(args),
      queryFn: useSearchFacetsQuery.fetcher(args),
    })
  }
)
