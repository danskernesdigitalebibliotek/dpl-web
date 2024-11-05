import { useRouter, useSearchParams } from "next/navigation"
import React, { useEffect, useRef, useState } from "react"

import { SearchFacetFragment, SearchFiltersInput } from "@/lib/graphql/generated/fbi/graphql"
import { cn } from "@/lib/helpers/helper.cn"

import Icon from "../icon/Icon"
import { getFacetTranslation, sortByActiveFacets, toggleFilter } from "./helper"

type SearchFiltersColumnProps = {
  facet: SearchFacetFragment
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
  const facetFilter = facet.name as keyof SearchFiltersInput

  const searchParams = useSearchParams()
  const elementRef = useRef<HTMLDivElement | null>(null)
  const [hasOverflow, setHasOverflow] = useState(false)

  useEffect(() => {
    const el = elementRef.current
    if (el) {
      const isOverflowing = el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth
      if (isOverflowing) {
        setHasOverflow(true)
      }
    }
  }, [elementRef])

  // We show the selected values first in the list
  facet.values = sortByActiveFacets(facet, searchParams)

  return (
    <>
      <div
        key={facet.name}
        className={cn(["relative ml-[-4px]", !isLast && "min-w-32 flex-1", isLast && "flex-2"])}>
        <h3 className="mb-2 pl-2 text-typo-caption uppercase">
          {getFacetTranslation(facetFilter)}
        </h3>
        <div
          className={cn([
            "flex gap-1 px-1 pt-2 text-typo-caption",
            !isLast && "flex-col",
            isLast && "flex-row flex-wrap content-start",
            !isExpanded && "h-[107px] overflow-hidden",
          ])}
          ref={elementRef}>
          {facet.values.map((value, index) => (
            <button
              onClick={() => toggleFilter(facet.name, value.term, router)}
              className={cn([
                `h-[29px] w-auto self-start whitespace-nowrap rounded-full bg-background-overlay px-4 py-2
                hover:animate-wiggle`,
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
                `flex h-[29px] w-auto flex-row items-center self-start whitespace-nowrap rounded-full
                bg-background-overlay pl-2 pr-4 text-typo-caption hover:animate-wiggle`,
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
