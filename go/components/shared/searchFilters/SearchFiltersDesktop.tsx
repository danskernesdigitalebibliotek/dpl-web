"use client"

import React from "react"

import { SearchFacetFragment } from "@/lib/graphql/generated/fbi/graphql"

import SearchFiltersColumn, { SearchFiltersColumnGhost } from "./SearchFiltersColumn"

const SearchFiltersDesktop = ({ facets }: { facets: SearchFacetFragment[] }) => {
  return (
    <div className="flex flex-row gap-4">
      {facets.map((facet, index) => {
        const isLast = index === facets.length - 1
        return <SearchFiltersColumn key={index} facet={facet} isLast={isLast} />
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
