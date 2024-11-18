import React, { useEffect, useRef, useState } from "react"

import { useSearchDataAndLoadingStates } from "@/components/pages/searchPageLayout/helper"
import { AnimateChangeInHeight } from "@/components/shared/animateChangeInHeight/AnimateChangeInHeight"
import BadgeButton from "@/components/shared/badge/BadgeButton"
import Icon from "@/components/shared/icon/Icon"
import {
  facetTermIsSelected,
  getFacetTranslation,
  sortByActiveFacets,
} from "@/components/shared/searchFilters/helper"
import { SearchFacetFragment } from "@/lib/graphql/generated/fbi/graphql"
import { cn } from "@/lib/helpers/helper.cn"
import { TFilters } from "@/lib/machines/search/types"
import useSearchMachineActor from "@/lib/machines/search/useSearchMachineActor"

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
  const actor = useSearchMachineActor()
  const facetFilter = facet.name as keyof TFilters
  const elementRef = useRef<HTMLDivElement | null>(null)
  const [hasOverflow, setHasOverflow] = useState(false)
  const { selectedFilters } = useSearchDataAndLoadingStates()

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
  if (selectedFilters) {
    facet.values = sortByActiveFacets(facet, selectedFilters)
  }

  return (
    <>
      <div
        key={facet.name}
        className={cn(
          "space-y-grid-gap-half relative",
          !isLast && "min-w-32 flex-1",
          isLast && "flex-2"
        )}>
        <h3 className="text-typo-caption uppercase">{getFacetTranslation(facetFilter)}</h3>

        <AnimateChangeInHeight className="overflow-visible">
          <div
            className={cn(
              "mx-[-10px] mt-[-10px] flex gap-1 px-[10px] pt-[10px] text-typo-caption",
              isLast ? "flex-row flex-wrap content-start" : "flex-col",
              {
                "h-[102px] overflow-hidden": !isExpanded,
              }
            )}
            ref={elementRef}>
            {facet.values.map((value, index) => (
              <BadgeButton
                key={index}
                ariaLabel={value.term}
                onClick={() =>
                  actor.send({ type: "TOGGLE_FILTER", name: facet.name, value: value.term })
                }
                isActive={facetTermIsSelected({
                  facet: facet.name,
                  term: value.term,
                  filters: selectedFilters,
                })}>
                {value.term}
              </BadgeButton>
            ))}
          </div>
          {hasOverflow && (
            <BadgeButton
              ariaLabel={isExpanded ? "Vis færre" : "Vis flere"}
              classNames={cn(`pl-3 w-auto flex flex-row items-center self-start  ml-1`)}
              onClick={() => {
                setIsExpanded(prev => !prev)
              }}>
              <Icon className={cn("h-8 w-8", isExpanded ? "rotate-180" : "")} name="arrow-down" />
              <p>{isExpanded ? "Skjul" : "Flere"}</p>
            </BadgeButton>
          )}
        </AnimateChangeInHeight>
      </div>
    </>
  )
}

export const SearchFiltersColumnGhost = () => {
  return (
    <div className="space-y-grid-gap-half">
      <div className="-mb-1 h-4 w-20 animate-pulse rounded-full bg-background-overlay"></div>
      <div className="space-y-1">
        <div className="h-7 w-10 animate-pulse rounded-full bg-background-overlay"></div>
        <div className="h-7 w-20 animate-pulse rounded-full bg-background-overlay"></div>
        <div className="h-7 w-32 animate-pulse rounded-full bg-background-overlay"></div>
        <div className="h-7 w-20 animate-pulse rounded-full bg-background-overlay"></div>
      </div>
    </div>
  )
}

export default SearchFiltersColumn
