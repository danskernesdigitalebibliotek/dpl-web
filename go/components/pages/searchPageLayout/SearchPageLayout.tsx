"use client"

import { useInfiniteQuery } from "@tanstack/react-query"
import { useInView } from "framer-motion"
import { motion } from "framer-motion"
import { useSearchParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"

import { facetDefinitions, mapFacetsToFilters } from "@/components/shared/searchFilters/helper"
import {
  FacetValue,
  SearchFiltersInput,
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
  const [currentQueryString, setCurrentQueryString] = useState("")
  const [currentPage, setCurrentPage] = useState(0)
  const [facetFilters, setFacetFilters] = useState<SearchFiltersInput>({})
  const loadMoreRef = useRef(null)
  const isInView = useInView(loadMoreRef)

  const facetsForSearchRequest = facetDefinitions.reduce(
    (acc: SearchFiltersInput, facetDefinition) => {
      const values = searchParams.getAll(facetDefinition)
      if (values.length > 0) {
        return {
          ...acc,
          [mapFacetsToFilters[facetDefinition]]: [...values],
        }
      }
      return acc
    },
    {} as { [key: string]: keyof SearchFiltersInput[] }
  )

  const {
    data,
    fetchNextPage,
    isLoading: isLoadingResults,
  } = useInfiniteQuery({
    queryKey: useSearchWithPaginationQuery.getKey({
      q: { all: currentQueryString },
      offset: 0,
      limit: SEARCH_RESULTS_LIMIT,
      filters: {
        branchId: branchIds,
        ...facetFilters,
      },
    }),
    queryFn: useSearchWithPaginationQuery.fetcher({
      q: { all: currentQueryString },
      offset: currentPage * SEARCH_RESULTS_LIMIT,
      limit: SEARCH_RESULTS_LIMIT,
      filters: {
        branchId: branchIds,
        ...facetFilters,
      },
    }),
    getNextPageParam: lastPage => {
      const totalPages = Math.ceil(lastPage.search.hitcount / SEARCH_RESULTS_LIMIT)
      const nextPage = currentPage + 1
      return currentPage < totalPages ? nextPage : undefined // By returning undefined if there are no more pages, hasNextPage boolean will be set to false
    },
    initialPageParam: 0,
    refetchOnWindowFocus: false,
    enabled: currentQueryString?.length > 0, // Disable search result & search filter queries if q doesn't exist
  })

  const { data: dataFacets, isLoading: isLoadingFacets } = useSearchFacetsQuery(
    {
      q: { all: currentQueryString },
      facetLimit: 100,
      facets: facetDefinitions,
      filters: {
        branchId: branchIds,
        ...facetsForSearchRequest,
      },
    },
    {
      refetchOnWindowFocus: false,
      enabled: currentQueryString?.length > 0,
    }
  )

  const handleLoadMore = () => {
    const totalPages = Math.ceil((data?.pages?.[0]?.search.hitcount ?? 0) / SEARCH_RESULTS_LIMIT)

    if (currentPage < totalPages) {
      fetchNextPage()
      setCurrentPage(currentPage + 1)
    }
  }

  useEffect(() => {
    if (isInView) {
      handleLoadMore()
    }
  }, [isInView])

  // TODO: consider finding a better way to control fetching of data without using the useEffects below
  useEffect(() => {
    const page = data?.pages.length || 0
    setCurrentPage(page)
  }, [data?.pages])

  useEffect(() => {
    setCurrentPage(0)
    setCurrentQueryString(q)
  }, [q])

  useEffect(() => {
    const isFilterMatching = JSON.stringify(facetFilters) === JSON.stringify(facetsForSearchRequest)
    if (!isFilterMatching) {
      setFacetFilters(facetsForSearchRequest)
      setCurrentPage(0)
    }
  }, [facetsForSearchRequest])

  const facetData = dataFacets?.search?.facets
  const hitcount = data?.pages?.[0]?.search.hitcount ?? 0
  const isNoFilters = !!(!isLoadingFacets && !facetData?.length)
  const isNoSearchResult = !!(!isLoadingResults && hitcount === 0)

  return (
    <div className="content-container">
      <h1 className="mt-[88px] text-typo-heading-2">{`Viser resultater for "${q}" ${hitcount ? "(" + hitcount + ")" : ""}`}</h1>
      {/* TODO: add ghost loading and cleanup the code below  */}
      {isLoadingFacets && <p>isLoadingFacets...</p>}
      {isNoFilters && <p>Ingen filter</p>}
      {facetData && facetData?.length > 0 && <SearchFilterBar facets={dataFacets.search.facets} />}
      {isLoadingResults && <p>isLoading...</p>}
      {isNoSearchResult && <p>Ingen søgeresultat</p>}
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
