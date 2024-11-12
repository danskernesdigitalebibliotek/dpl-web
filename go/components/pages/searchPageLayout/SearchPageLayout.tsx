"use client"

import { useInfiniteQuery } from "@tanstack/react-query"
import { useInView } from "framer-motion"
import { motion } from "framer-motion"
import { useSearchParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"

import SearchFiltersMobile from "@/components/shared/searchFilters/SearchFiltersMobile"
import { getFacetMachineNames } from "@/components/shared/searchFilters/helper"
import goConfig from "@/lib/config/config"
import {
  FacetValue,
  SearchFiltersInput,
  useSearchFacetsQuery,
  useSearchWithPaginationQuery,
} from "@/lib/graphql/generated/fbi/graphql"

import SearchFiltersDesktop, {
  SearchFiltersDesktopGhost,
} from "../../shared/searchFilters/SearchFiltersDesktop"
import SearchResults, { SearchResultsGhost } from "./SearchResults"
import { getFacetsForSearchRequest, getNextPageParamsFunc, getSearchQueryArguments } from "./helper"

const SEARCH_RESULTS_LIMIT = goConfig<number>("search.item.limit")

export type FilterItemTerm = Omit<FacetValue, "__typename">

const SearchPageLayout = ({ searchQuery }: { searchQuery?: string }) => {
  const searchParams = useSearchParams()
  const q = searchQuery || searchParams.get("q") || ""
  const [currentQueryString, setCurrentQueryString] = useState("")
  const [currentPage, setCurrentPage] = useState(0)
  const [facetFilters, setFacetFilters] = useState<SearchFiltersInput>({})
  const loadMoreRef = useRef(null)
  const isInView = useInView(loadMoreRef)
  const facets = getFacetMachineNames()

  const facetsForSearchRequest = getFacetsForSearchRequest(searchParams)
  const searchQueryArguments = getSearchQueryArguments({
    q: currentQueryString,
    currentPage,
    facetFilters,
  })

  const {
    data,
    fetchNextPage,
    isLoading: isLoadingResults,
    isFetchingNextPage: isFetchingMoreResults,
    isFetching: isFetchingResults,
    isPending: isPendingResults,
  } = useInfiniteQuery({
    queryKey: useSearchWithPaginationQuery.getKey({
      ...searchQueryArguments,
      offset: goConfig("search.offset.initial"),
    }),
    queryFn: useSearchWithPaginationQuery.fetcher(searchQueryArguments),
    getNextPageParam: getNextPageParamsFunc(currentPage),
    initialPageParam: goConfig<number>("search.param.initial"),
    refetchOnWindowFocus: false,
    enabled: currentQueryString?.length > 0, // Disable search result & search filter queries if q doesn't exist
  })

  const { data: dataFacets, isLoading: isLoadingFacets } = useSearchFacetsQuery(
    {
      q: searchQueryArguments.q,
      facetLimit: goConfig("search.facet.limit"),
      facets,
      filters: searchQueryArguments.filters,
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
    // We choose to ignore the eslint warning below
    // because we do not want to add the handleMore callback which changes on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // Check if the filters in URL have changed
    const isFilterMatching = JSON.stringify(facetFilters) === JSON.stringify(facetsForSearchRequest)
    if (!isFilterMatching) {
      setFacetFilters(facetsForSearchRequest)
      setCurrentPage(0)
    }
  }, [facetFilters, facetsForSearchRequest])

  const facetData = dataFacets?.search?.facets
  const hitcount = data?.pages?.[0]?.search.hitcount ?? 0
  const isLoading =
    isLoadingResults || isFetchingMoreResults || isFetchingResults || isPendingResults

  return (
    <div className="content-container my-grid-gap-2 space-y-grid-gap-2">
      <h1 className="text-typo-heading-3 lg:text-typo-heading-2">
        {`Viser resultater for "${q}" ${hitcount ? "(" + hitcount + ")" : ""}`}
      </h1>
      {q ? (
        <>
          {!isLoadingFacets && facetData && facetData?.length > 0 ? (
            <div className="relative">
              <div className="xl:hidden">
                <SearchFiltersMobile facets={dataFacets.search.facets} />
              </div>
              <div className="hidden xl:block">
                <SearchFiltersDesktop facets={dataFacets.search.facets} />
              </div>
            </div>
          ) : (
            <>
              <div className="xl:hidden">{/* <SearchFiltersMobileGhost /> */}</div>
              <div className="hidden xl:block">
                <SearchFiltersDesktopGhost />
              </div>
            </>
          )}
          <hr className="-mx-grid-edge w-screen border-foreground opacity-10 md:mx-auto md:w-full" />
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
            {isLoading && <SearchResultsGhost />}
          </div>
          <div ref={loadMoreRef} className="h-0 opacity-0"></div>
        </>
      ) : (
        <div className="text-typo-body-1">
          <p className="text-foreground opacity-80">Ingen søgeord fundet</p>
        </div>
      )}
    </div>
  )
}

export default SearchPageLayout
