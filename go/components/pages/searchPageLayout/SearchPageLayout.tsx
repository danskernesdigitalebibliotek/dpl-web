"use client"

import { motion, useInView } from "framer-motion"
import { useEffect, useRef } from "react"

import SearchResults, {
  SearchResultsSkeleton,
} from "@/components/pages/searchPageLayout/SearchResults"
import { useSearchDataAndLoadingStates } from "@/components/pages/searchPageLayout/helper"
import SearchFiltersDesktop, {
  SearchFiltersDesktopSkeleton,
} from "@/components/shared/searchFilters/SearchFiltersDesktop"
import SearchFiltersMobile from "@/components/shared/searchFilters/SearchFiltersMobile"
import useSearchMachineActor from "@/lib/machines/search/useSearchMachineActor"

const SearchPageLayout = () => {
  const loadMoreRef = useRef(null)
  const loadMoreRefIsInView = useInView(loadMoreRef)
  const actor = useSearchMachineActor()
  const {
    data,
    isLoadingFacets,
    isLoadingResults,
    isLoadingMoreResults,
    machineIsReady,
    searchQuery,
  } = useSearchDataAndLoadingStates()

  useEffect(() => {
    if (loadMoreRefIsInView) {
      actor.send({ type: "LOAD_MORE" })
    }
    // We choose to ignore the eslint warning below
    // because we do not want to add the handleMore callback which changes on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadMoreRefIsInView])

  const isNoSearchResult = !isLoadingResults && (!data.search || !data.search.pages[0].length)
  const hitCountText = data.search?.hitcount ? `(${data.search.hitcount})` : ""
  const searchQueryText = searchQuery ? `"${searchQuery}"` : ""

  return (
    <div className="content-container space-y-grid-gap-2">
      {searchQuery && (
        <h1 className="text-typo-heading-3 lg:text-typo-heading-2">
          {`Viser resultater for ${searchQueryText} ${hitCountText}`}
        </h1>
      )}
      {searchQuery ? (
        <>
          {!isLoadingFacets && data.facets && data.facets.length > 0 ? (
            <div className="relative">
              <div className="xl:hidden">
                <SearchFiltersMobile facets={data.facets} />
              </div>
              <div className="hidden xl:block">
                <SearchFiltersDesktop facets={data.facets} />
              </div>
            </div>
          ) : (
            <>
              <div className="xl:hidden">{/* <SearchFiltersMobileSkeleton /> */}</div>
              <div className="hidden xl:block">
                <SearchFiltersDesktopSkeleton />
              </div>
            </>
          )}
          <hr />
          <div className="mb-space-y flex flex-col gap-y-[calc(var(--grid-gap-x)*2)]">
            {isNoSearchResult && (
              <p className="text-typo-subtitle-lg opacity-35">Ingen søgeresultat</p>
            )}
            {data.search &&
              data.search.pages.map(
                (works, i) =>
                  works && (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5 }}
                      exit={{ opacity: 0 }}>
                      <SearchResults works={works} />
                    </motion.div>
                  )
              )}
            {(isLoadingMoreResults || isLoadingResults) && <SearchResultsSkeleton />}
          </div>
        </>
      ) : (
        <>
          {machineIsReady && (
            <div className="text-typo-body-1">
              <p className="text-foreground opacity-80">Ingen søgeord fundet</p>
            </div>
          )}
        </>
      )}
      <div ref={loadMoreRef} className="h-0 -translate-y-[500px] opacity-0"></div>
    </div>
  )
}

export default SearchPageLayout
