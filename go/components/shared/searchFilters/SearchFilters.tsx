"use client"

import { useRouter, useSearchParams } from "next/navigation"
import React, { useRef, useState } from "react"

import { SearchFacetsQuery } from "@/lib/graphql/generated/fbi/graphql"
import { mapFacetsToFilters } from "./helper"
import SearchFiltersColumn from "./SearchFiltersColumn"

type SearchFilterBarProps = {
  facets: SearchFacetsQuery["search"]["facets"]
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
            />
          )
        })}
      </div>
    </>
  )
}

export default SearchFilterBar
