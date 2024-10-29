"use client"

import React, { useState } from "react"

import { SearchFacetFragment } from "@/lib/graphql/generated/fbi/graphql"
import SearchFiltersColumn from "./SearchFiltersColumn"

type SearchFilterBarProps = {
  facets: SearchFacetFragment[]
}

const SearchFilterBar = ({ facets }: SearchFilterBarProps) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false)

  return (
    <>
      <div className="xl:hidden">Mobile Filters</div>
      <div className="mt-10 hidden flex-row gap-4 xl:flex">
        {facets.map((facet, index) => {
          const isLast = index === facets.length - 1
          return (
            <SearchFiltersColumn
              facet={facet}
              isLast={isLast}
              key={facet.name}
              isExpanded={isExpanded}
              setIsExpanded={setIsExpanded}
            />
          )
        })}
      </div>
      <hr className="my-3 -mx-grid-edge w-screen border-black opacity-10 md:mx-auto md:mb-12 md:mt-6 md:w-full" />
    </>
  )
}

export default SearchFilterBar
