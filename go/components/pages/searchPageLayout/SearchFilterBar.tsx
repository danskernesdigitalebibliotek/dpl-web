'use client'

import { Badge } from '@/components/ui/badge'
import { SearchFacetsQuery } from '@/lib/graphql/generated/fbi/graphql'
import { cn } from '@/lib/utils'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect } from 'react'

type facets = SearchFacetsQuery['search']['facets']

const SearchFilterBar = ({ facets }: { facets: facets }) => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const toggleFilter = (filterName: string, value: string) => {
    const searchParams = new URLSearchParams(window.location.search)

    if (searchParams.has(filterName)) {
      if (searchParams.get(filterName) === value) {
        searchParams.delete(filterName)
      } else {
        searchParams.delete(filterName)
        searchParams.append(filterName, value)
      }
    } else {
      searchParams.append(filterName, value)
    }

    const searchParamsString = searchParams.toString()

    router.push(
      '/search' + searchParamsString ? `?${searchParamsString}` : '',
      { scroll: false }
    )
  }

  return (
    <div className="flex flex-wrap gap-4">
      {facets.length > 0 &&
        facets.map((facet) => (
          <div key={facet.name} className="space-y-2">
            <h3 className="text-typo-caption uppercase">{facet.name}</h3>
            <div className="flex flex-wrap gap-1">
              {facet.values.map((value, index) => (
                <button
                  onClick={() => toggleFilter(facet.name, value.term)}
                  className={cn(
                    `whitespace-nowrap rounded-lg bg-background-foreground px-4 py-2`,
                    value.term === searchParams.get(facet.name) && 'bg-primary'
                  )}
                  key={index}
                >
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
