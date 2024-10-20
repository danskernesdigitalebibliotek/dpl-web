import { SearchFacetsQuery } from "@/lib/graphql/generated/fbi/graphql"
import { cn } from "@/lib/utils"
import React from "react"
import { mapFacetsToFilters, mapFilterNameToTranslation, toggleFilter } from "./helper"
import { useRouter, useSearchParams } from "next/navigation"

type SearchFiltersColumnProps = {
  facet: SearchFacetsQuery["search"]["facets"][0]
  isLast: boolean
  isExpanded: boolean
}

const SearchFiltersColumn = ({ facet, isLast, isExpanded }: SearchFiltersColumnProps) => {
  const router = useRouter()
  const facetName = facet.name as keyof typeof mapFacetsToFilters
  const searchParams = useSearchParams()

  return (
    <div key={facet.name} className={cn([!isLast && "min-w-32 flex-1", isLast && "flex-2"])}>
      <h3 className="mb-2 text-typo-caption uppercase">{mapFilterNameToTranslation[facetName]}</h3>
      <div
        className={cn([
          "flex gap-1 text-typo-caption",
          !isLast && "flex-col",
          isLast && "flex-row flex-wrap",
          !isExpanded && "h-[98px] overflow-hidden",
        ])}>
        {facet.values.map((value, index) => (
          <button
            onClick={() => toggleFilter(facet.name, value.term, router)}
            className={cn([
              "h-[29px] w-auto self-start whitespace-nowrap rounded-full bg-background-overlay px-4 py-2",
              searchParams.getAll(facet.name).includes(value.term) &&
                "bg-foreground text-background",
            ])}
            key={index}>
            {value.term}
          </button>
        ))}
      </div>
    </div>
  )
}

export default SearchFiltersColumn
