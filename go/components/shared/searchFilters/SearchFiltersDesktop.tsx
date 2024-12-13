"use client"

import React from "react"

import { SearchFacetFragment } from "@/lib/graphql/generated/fbi/graphql"

import SearchFiltersColumn, { SearchFiltersColumnSkeleton } from "./SearchFiltersColumn"

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

export const SearchFiltersDesktopSkeleton = () => {
  const skeletonItems = Array.from({ length: 5 })

  return (
    <div className="flex flex-row gap-4">
      {skeletonItems.map((_, index) => (
        <SearchFiltersColumnSkeleton key={index} />
      ))}
    </div>
  )
}

export default SearchFiltersDesktop
