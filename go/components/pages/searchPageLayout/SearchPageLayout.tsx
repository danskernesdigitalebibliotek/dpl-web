"use client"

import { useInfiniteQuery } from "@tanstack/react-query"
import { useInView } from "framer-motion"
import { motion } from "framer-motion"
import { useSearchParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"

import { facetDefinitions, mapFacetsToFilters } from "@/components/shared/searchFilters/helper"
import {
  FacetValue,
  SearchFilters,
  useSearchFacetsQuery,
  useSearchWithPaginationQuery,
} from "@/lib/graphql/generated/fbi/graphql"

import SearchFilterBar from "../../shared/searchFilters/SearchFilterBar"
import SearchResults from "./SearchResults"

// TODO: Add branches though endpoint
const branchIds = [
  "775120",
  "775122",
  "775144",
  "775167",
  "775146",
  "775168",
  "751010",
  "775147",
  "751032",
  "751031",
  "775126",
  "751030",
  "775149",
  "775127",
  "775160",
  "775162",
  "775140",
  "751009",
  "751029",
  "751027",
  "751026",
  "751025",
  "775133",
  "751024",
  "775100",
  "775170",
  "775150",
  "775130",
] as string[]

const SEARCH_RESULTS_LIMIT = 9

export type FilterItemTerm = Omit<FacetValue, "__typename">

export const formatFacetTerms = (filters: { [key: string]: { [key: string]: FilterItemTerm } }) => {
  return Object.keys(filters).reduce(
    (acc, key) => ({
      ...acc,
      [key]: Object.keys(filters[key]),
    }),
    {}
  )
}

const SearchPageLayout = ({ searchQuery }: { searchQuery?: string }) => {
  const searchParams = useSearchParams()
  const q = searchQuery || searchParams.get("q") || ""
  const [currentPage, setCurrentPage] = useState(0)
  const [filters, setFilters] = useState<SearchFilters>({})
  const loadMoreRef = useRef(null)
  const isInView = useInView(loadMoreRef)

  const facetsForSearchRequest = facetDefinitions.reduce(
    (acc: SearchFilters, facetDefinition) => {
      const values = searchParams.getAll(facetDefinition)
      if (values.length > 0) {
        return {
          ...acc,
          [mapFacetsToFilters[facetDefinition]]: [...values],
        }
      }
      return acc
    },
    {} as { [key: string]: keyof SearchFilters[] }
  )

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: useSearchWithPaginationQuery.getKey({
      q: { all: q },
      offset: 0,
      limit: SEARCH_RESULTS_LIMIT,
      filters: {
        branchId: branchIds,
        ...filters,
      },
    }),
    queryFn: useSearchWithPaginationQuery.fetcher({
      q: { all: q },
      offset: currentPage * SEARCH_RESULTS_LIMIT,
      limit: SEARCH_RESULTS_LIMIT,
      filters: {
        branchId: branchIds,
        ...filters,
      },
    }),
    getNextPageParam: lastPage => {
      const totalPages = Math.ceil(lastPage.search.hitcount / SEARCH_RESULTS_LIMIT)
      const nextPage = currentPage + 1
      return currentPage < totalPages ? nextPage : undefined // By returning undefined if there are no more pages, hasNextPage boolean will be set to false
    },
    initialPageParam: 1,
    refetchOnWindowFocus: false,
    enabled: q?.length > 0, // Disable search result & search filter queries if q doesn't exist
  })

  const { data: dataFacets, isLoading: isLoadingFacets } = useSearchFacetsQuery(
    {
      q: { all: q },
      facetLimit: 100,
      facets: facetDefinitions,
      filters: {
        branchId: branchIds,
        ...facetsForSearchRequest,
      },
    },
    {
      refetchOnReconnect: true,
      refetchOnMount: true,
      enabled: q?.length > 0,
    }
  )

  const facetData = dataFacets?.search?.facets
  const searchData = data?.pages?.[0]?.search

  const totalPages = Math.ceil((data?.pages?.[0]?.search.hitcount ?? 0) / SEARCH_RESULTS_LIMIT)

  const handleLoadMore = () => {
    if (currentPage + 1 < totalPages) {
      fetchNextPage()
      setCurrentPage(currentPage + 1)
    }
  }

  useEffect(() => {
    if (isInView) {
      handleLoadMore()
    }
  }, [isInView])

  useEffect(() => {
    setFilters({ ...facetsForSearchRequest })
    setCurrentPage(1)
  }, [])

  useEffect(() => {
    const isFilterMatching = JSON.stringify(filters) === JSON.stringify(facetsForSearchRequest)
    if (!isFilterMatching) {
      setFilters(facetsForSearchRequest)
      setCurrentPage(0)
    }
  }, [facetsForSearchRequest])

  return (
    <div className="content-container">
      <h1 className="mt-[88px] text-typo-heading-2">{`Viser resultater for "${q}" ${data?.pages?.[0]?.search.hitcount ? "(" + data?.pages?.[0]?.search.hitcount + ")" : ""}`}</h1>
      {isLoadingFacets && <p>isLoadingFacets...</p>}
      {!facetData?.length && <p>Ingen filter</p>}
      {facetData && facetData?.length > 0 && <SearchFilterBar facets={dataFacets.search.facets} />}
      {isLoading && <p>isLoading...</p>}

      {data?.pages?.[0]?.search.hitcount === 0 && <p>Ingen søgeresultat</p>}
      <div className="mb-space-y flex flex-col gap-y-[calc(var(--grid-gap-x)*2)]">
        {data?.pages.map(
          (page, i) =>
            page.search.works && (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                exit={{ opacity: 0 }}>
                <SearchResults works={page.search.works} />
              </motion.div>
            )
        )}
      </div>
      <div ref={loadMoreRef} className="h-0 opacity-0"></div>
    </div>
  )
}

export default SearchPageLayout
