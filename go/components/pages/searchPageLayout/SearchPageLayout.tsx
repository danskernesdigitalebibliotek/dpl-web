"use client"

import { motion, useInView } from "framer-motion"
import { useEffect, useRef } from "react"

import { WorkTeaserFragment } from "@/lib/graphql/generated/fbi/graphql"
import useSearchMachineActor from "@/lib/machines/search/useSearchMachineActor"

import SearchFilterBar from "../../shared/searchFilters/SearchFilterBar"
import SearchResults from "./SearchResults"
import { useSearchDataAndLoadingStates } from "./helper"

const SearchPageLayout = () => {
  const loadMoreRef = useRef(null)
  const isInView = useInView(loadMoreRef)
  const actor = useSearchMachineActor()
  const { data, isLoadingFacets, isLoadingResults, q } = useSearchDataAndLoadingStates()

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

  return (
    <div className="content-container">
      {q && (
        <h1 className="mt-8 text-typo-heading-3 lg:mt-[88px] lg:text-typo-heading-2">
          {`Viser resultater for "${q}" ${hitCountText}`}
        </h1>
      )}
      {/* TODO: add ghost loading and cleanup the code below  */}
      {isLoadingFacets && <p>isLoadingFacets...</p>}
      {data.facets && <SearchFilterBar facets={data.facets} />}
      {isLoadingResults && <p>isLoading...</p>}
      {isNoSearchResult && <p>Ingen søgeresultat</p>}
      {data.search && (
        <div className="mb-space-y flex flex-col gap-y-[calc(var(--grid-gap-x)*2)]">
          {data.search.pages.map(
            (works: WorkTeaserFragment[], i: number) =>
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
        </div>
      )}
      <div ref={loadMoreRef} className="h-0 opacity-0"></div>
    </div>
  )
  return null
}

export default SearchPageLayout
