"use client"

import React, { Suspense, useState } from "react"

import { SearchFacetFragment } from "@/lib/graphql/generated/fbi/graphql"

import SearchFiltersColumn from "./SearchFiltersColumn"
import SearchFiltersMobile from "./SearchFiltersMobile"

type SearchFilterBarProps = {
  facets: SearchFacetFragment[]
}

const SearchFilterBar = ({ facets }: SearchFilterBarProps) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false)

  return (
    <>
      <div className="mt-3 xl:hidden">
        <SearchFiltersMobile facets={facets} />
      </div>
      <div className="mt-10 hidden flex-row gap-4 xl:flex">
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
      <hr className="-mx-grid-edge my-3 w-screen border-black opacity-10 md:mx-auto md:mb-12 md:mt-6 md:w-full" />
    </>
  )
}

export default SearchFilterBar
