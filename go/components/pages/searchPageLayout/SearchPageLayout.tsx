"use client"

import { motion, useInView } from "framer-motion"
import { useSearchParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"

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
  const searchParams = useSearchParams()
  const qFromUrl = searchParams.get("q") ?? ""
  const actor = useSearchMachineActor()
  const { data, isLoadingFacets, isLoadingResults, isLoadingMoreResults } =
    useSearchDataAndLoadingStates()
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (loadMoreRefIsInView) {
      actor.send({ type: "LOAD_MORE" })
    }
    // We choose to ignore the eslint warning below
    // because we do not want to add the handleMore callback which changes on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadMoreRefIsInView])

  const hasSearchQuery = Boolean(qFromUrl)
  const hasSearchData = Boolean(data.search)
  const isSearching = isLoadingResults || isLoadingMoreResults
  // XState data is client-only; defer result UI until after hydration to match SSR.
  const showResultsSkeleton = hasSearchQuery && (!isHydrated || isSearching || !hasSearchData)
  const showNoResults =
    isHydrated && hasSearchQuery && hasSearchData && !isSearching && !data.search?.pages[0]?.length
  const hitCountText = isHydrated && data.search?.hitcount ? `(${data.search.hitcount})` : ""
  const searchQueryText = `"${qFromUrl}"`

  return (
    <div className="content-container space-y-grid-gap-2">
      {hasSearchQuery && (
        <>
          <h1 className="text-typo-heading-3 lg:text-typo-heading-2">
            {`Viser resultater for ${searchQueryText} ${hitCountText}`}
          </h1>
          <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
            {isHydrated && !isLoadingResults && data.search
              ? data.search.hitcount
                ? `Viser ${data.search.hitcount} resultater for søgningen "${qFromUrl}"`
                : "Intet søgeresultat"
              : ""}
          </div>
        </>
      )}
      {hasSearchQuery ? (
        <>
          {isHydrated && !isLoadingFacets && data.facets && data.facets.length > 0 ? (
            <div className="relative">
              <div className="lg:hidden">
                <SearchFiltersMobile facets={data.facets} />
              </div>
              <div className="hidden lg:block">
                <SearchFiltersDesktop facets={data.facets} />
              </div>
            </div>
          ) : (
            <>
              <div className="hidden lg:block">
                <SearchFiltersDesktopSkeleton />
              </div>
            </>
          )}
          <hr />
          <div className="mb-space-y flex flex-col gap-y-[calc(var(--grid-gap-x)*2)]">
            {showNoResults && (
              <p className="text-typo-subtitle-lg opacity-35">Intet søgeresultat</p>
            )}
            {isHydrated &&
              data.search?.pages.map(
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
            {showResultsSkeleton && <SearchResultsSkeleton />}
          </div>
        </>
      ) : (
        <>
          <div className="text-typo-body-1">
            <p className="text-foreground opacity-80">Ingen søgeord fundet</p>
          </div>
        </>
      )}
      <div ref={loadMoreRef} className="h-0 -translate-y-[500px] opacity-0"></div>
    </div>
  )
}

export default SearchPageLayout
