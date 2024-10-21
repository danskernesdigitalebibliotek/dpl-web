import { SearchFacetsQuery } from "@/lib/graphql/generated/fbi/graphql"
import { cn } from "@/lib/utils"
import React, { useEffect, useRef, useState } from "react"
import { mapFacetsToFilters, mapFilterNameToTranslation, toggleFilter } from "./helper"
import { useRouter, useSearchParams } from "next/navigation"
import Icon from "../icon/Icon"
import { Button } from "../button/Button"

type SearchFiltersColumnProps = {
  facet: SearchFacetsQuery["search"]["facets"][0]
  isLast: boolean
  isExpanded: boolean
  setIsExpanded: React.Dispatch<React.SetStateAction<boolean>>
}

const SearchFiltersColumn = ({
  facet,
  isLast,
  isExpanded,
  setIsExpanded,
}: SearchFiltersColumnProps) => {
  const router = useRouter()
  const facetName = facet.name as keyof typeof mapFacetsToFilters
  const searchParams = useSearchParams()
  const elementRef = useRef<HTMLDivElement | null>(null)
  const [hasOverflow, setHasOverflow] = useState(false)

  useEffect(() => {
    const el = elementRef.current
    if (el) {
      const isOverflowing = el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth
      isOverflowing ? setHasOverflow(true) : null
    }
  }, [elementRef])

  return (
    <>
      <div
        key={facet.name}
        className={cn(["relative", !isLast && "min-w-32 flex-1", isLast && "flex-2"])}>
        <h3 className="mb-2 text-typo-caption uppercase">
          {mapFilterNameToTranslation[facetName]}
        </h3>
        <div
          className={cn([
            "flex gap-1 text-typo-caption",
            !isLast && "flex-col",
            isLast && "flex-row flex-wrap",
            !isExpanded && "h-[98px] overflow-hidden",
          ])}
          ref={elementRef}>
          {facet.values.map((value, index) => (
            <button
              onClick={() => toggleFilter(facet.name, value.term, router)}
              className={cn([
                `hover:animate-wiggle h-[29px] w-auto self-start whitespace-nowrap rounded-full bg-background-overlay
                px-4 py-2`,
                searchParams.getAll(facet.name).includes(value.term) &&
                  "bg-foreground text-background",
              ])}
              key={index}>
              {value.term}
            </button>
          ))}
        </div>
        {hasOverflow && (
          <div
            className="h-9 w-9 cursor-pointer"
            onClick={() => {
              setIsExpanded(prev => !prev)
            }}>
            <button
              className={cn(
                `hover:animate-wiggle flex h-[29px] w-auto flex-row items-center self-start whitespace-nowrap
                rounded-full bg-background-overlay pl-2 pr-4 text-typo-caption`,
                isExpanded && "mt-1"
              )}>
              <Icon className={cn("h-8 w-8", isExpanded && "rotate-180")} name="arrow-down" />
              <p>
                {!isExpanded && "Flere"} {isExpanded && "Skjul"}
              </p>
            </button>
          </div>
        )}
      </div>
    </>
  )
}

export default SearchFiltersColumn
