"use client"

import { useRouter, useSearchParams } from "next/navigation"
import React from "react"

import { SearchFacetsQuery } from "@/lib/graphql/generated/fbi/graphql"
import { cn } from "@/lib/utils"

type facets = SearchFacetsQuery["search"]["facets"]

const SearchFilterBar = ({ facets }: { facets: facets }) => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const toggleFilter = (filterName: string, value: string) => {
    const searchParams = new URLSearchParams(window.location.search)

    if (searchParams.has(filterName)) {
      const filterValues = [...searchParams.getAll(filterName)]

      searchParams.delete(filterName)

      if (filterValues.includes(value)) {
        filterValues.splice(filterValues.indexOf(value), 1)
      } else {
        filterValues.push(value)
      }

      filterValues.forEach(filterValue => {
        searchParams.append(filterName, filterValue)
      })
    } else {
      searchParams.append(filterName, value)
    }

    const searchParamsString = searchParams.toString()

    router.push("/search" + searchParamsString ? `?${searchParamsString}` : "", { scroll: false })
  }

  return (
    <div className="flex flex-wrap gap-4">
      {facets.length > 0 &&
        facets.map(facet => (
          <div key={facet.name} className="space-y-2">
            <h3 className="text-typo-caption uppercase">{facet.name}</h3>
            <div className="flex flex-wrap gap-1">
              {facet.values.map((value, index) => (
                <button
                  onClick={() => toggleFilter(facet.name, value.term)}
                  className={cn(
                    "bg-background-foreground whitespace-nowrap rounded-lg px-4 py-2",
                    searchParams.getAll(facet.name).includes(value.term) && "bg-background-overlay"
                  )}
                  key={index}>
                  {value.term}
                </button>
              ))}
            </div>
          </div>
        ))}
    </div>
  )
}

export default SearchFilterBar
