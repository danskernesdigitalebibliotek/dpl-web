"use client"

import { motion, useInView } from "framer-motion"
import { useEffect, useRef } from "react"

import SearchFiltersMobile from "@/components/shared/searchFilters/SearchFiltersMobile"
import useSearchMachineActor from "@/lib/machines/search/useSearchMachineActor"

import SearchFiltersDesktop, {
  SearchFiltersDesktopGhost,
} from "../../shared/searchFilters/SearchFiltersDesktop"
import SearchResults, { SearchResultsGhost } from "./SearchResults"
import { useSearchDataAndLoadingStates } from "./helper"

const SearchPageLayout = () => {
  const loadMoreRef = useRef(null)
  const isInView = useInView(loadMoreRef)
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
    if (isInView) {
      actor.send({ type: "LOAD_MORE" })
    }
    // We choose to ignore the eslint warning below
    // because we do not want to add the handleMore callback which changes on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInView])

  const isNoSearchResult = !isLoadingResults && (!data.search || !data.search.pages[0].length)
  const hitCountText = data.search?.hitcount ? `(${data.search.hitcount})` : ""
  const searchQueryText = searchQuery ? `"${searchQuery}"` : ""

  return (
    <div className="content-container my-grid-gap-2 space-y-grid-gap-2">
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
              <div className="xl:hidden">{/* <SearchFiltersMobileGhost /> */}</div>
              <div className="hidden xl:block">
                <SearchFiltersDesktopGhost />
              </div>
            </>
          )}
          <hr className="-mx-grid-edge w-screen border-foreground opacity-10 md:mx-auto md:w-full" />
          <div className="mb-space-y flex flex-col gap-y-[calc(var(--grid-gap-x)*2)]">
            {isNoSearchResult && <p>Ingen søgeresultat</p>}
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
            {isLoadingMoreResults && <SearchResultsGhost />}
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
      <div ref={loadMoreRef} className="h-0 opacity-0"></div>
    </div>
  )
}

export default SearchPageLayout
