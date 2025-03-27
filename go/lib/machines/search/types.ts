import { QueryClient } from "@tanstack/react-query"

import {
  SearchFacetsQuery,
  SearchFiltersInput,
  SearchWithPaginationQuery,
} from "@/lib/graphql/generated/fbi/graphql"

export type TFilters = Omit<SearchFiltersInput, "status">

export type TChildrenOrAdultsOption = "til børn" | "til voksne"

export type TContext = {
  facetLimit: number
  searchOffset: number
  searchPageSize: number
  currentQuery: string
  submittedQuery?: string
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
