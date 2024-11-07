import { QueryClient } from "@tanstack/react-query"

import {
  SearchFacetsQuery,
  SearchFiltersInput,
  SearchWithPaginationQuery,
} from "@/lib/graphql/generated/fbi/graphql"

export type TContext = {
  currentQ: string
  searchData?: SearchWithPaginationQuery["search"]
  facetData?: SearchFacetsQuery["search"]["facets"]
  selectedFilters: TFilters
  queryClient: QueryClient | null
}

export type TFilters = Omit<SearchFiltersInput, "status">

export type TInput = {
  q?: string
  filters?: TFilters
  queryClient?: QueryClient
}
