import { QueryClient } from "@tanstack/react-query"

import {
  SearchFacetsQuery,
  SearchFiltersInput,
  SearchWithPaginationQuery,
} from "@/lib/graphql/generated/fbi/graphql"

export type TFilters = Omit<SearchFiltersInput, "status">

export type TContext = {
  facetLimit: number
  searchOffset: number
  searchPageSize: number
  currentQ: string
  searchData?: {
    hitcount: SearchWithPaginationQuery["search"]["hitcount"]
    pages: SearchWithPaginationQuery["search"]["works"][]
  }
  facetData?: SearchFacetsQuery["search"]["facets"]
  selectedFilters: TFilters
  queryClient: QueryClient | null
}

export type TInput = {
  q?: string
  filters?: TFilters
  queryClient?: QueryClient
  initialOffset: number
  searchPageSize: number
  facetLimit: number
}
