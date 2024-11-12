"use client"

import React, { Suspense, useState } from "react"

import { SearchFacetFragment } from "@/lib/graphql/generated/fbi/graphql"

import SearchFiltersColumn, { SearchFiltersColumnGhost } from "./SearchFiltersColumn"

const SearchFiltersDesktop = ({ facets }: { facets: SearchFacetFragment[] }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false)

  return (
    <div className="flex flex-row gap-4">
      {facets.map((facet, index) => {
        const isLast = index === facets.length - 1
        return (
          <Suspense key={facet.name} fallback={<p>Loading...</p>}>
            <SearchFiltersColumn
              facet={facet}
              isLast={isLast}
              isExpanded={isExpanded}
              setIsExpanded={setIsExpanded}
            />
          </Suspense>
        )
      })}
    </div>
  )
}

export const SearchFiltersDesktopGhost = () => {
  const ghostItems = Array.from({ length: 5 })

  return (
    <div className="flex flex-row gap-4">
      {ghostItems.map((_, index) => (
        <SearchFiltersColumnGhost key={index} />
      ))}
    </div>
  )
}

export default SearchFiltersDesktop
