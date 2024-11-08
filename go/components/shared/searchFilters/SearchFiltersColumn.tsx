import React, { useEffect, useRef, useState } from "react"

import { useSearchDataAndLoadingStates } from "@/components/pages/searchPageLayout/helper"
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
        className={cn("relative ml-[-4px]", !isLast && "min-w-32 flex-1", isLast && "flex-2")}>
        <h3 className="mb-2 pl-2 text-typo-caption uppercase">
          {getFacetTranslation(facetFilter)}
        </h3>
        <div
          className={cn(
            "flex gap-1 px-1 pt-2 text-typo-caption",
            !isLast && "flex-col",
            isLast && "flex-row flex-wrap content-start",
            !isExpanded && "h-[107px] overflow-hidden"
          )}
          ref={elementRef}>
          {facet.values.map((value, index) => (
            <BadgeButton
              onClick={() =>
                actor.send({ type: "TOGGLE_FILTER", name: facet.name, value: value.term })
              }
              isActive={facetTermIsSelected({
                facet: facet.name,
                term: value.term,
                filters: selectedFilters,
              })}
              key={index}>
              {value.term}
            </BadgeButton>
          ))}
        </div>
        {hasOverflow && (
          <BadgeButton
            classNames={cn(`pl-3 w-auto flex flex-row items-center self-start  ml-1`)}
            onClick={() => {
              setIsExpanded(prev => !prev)
            }}>
            <Icon className={cn("h-8 w-8", isExpanded ? "rotate-180" : "")} name="arrow-down" />
            <p>
              {!isExpanded && "Flere"} {isExpanded && "Skjul"}
            </p>
          </BadgeButton>
        )}
      </div>
    </>
  )
}

export default SearchFiltersColumn
