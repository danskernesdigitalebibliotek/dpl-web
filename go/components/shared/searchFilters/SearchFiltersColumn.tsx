import React, { useCallback, useEffect, useRef, useState } from "react"

import { useSearchDataAndLoadingStates } from "@/components/pages/searchPageLayout/helper"
import { AnimateChangeInHeight } from "@/components/shared/animateChangeInHeight/AnimateChangeInHeight"
import BadgeButton from "@/components/shared/badge/BadgeButton"
import Icon from "@/components/shared/icon/Icon"
import {
  createToggleFilterCallback,
  facetTermIsSelected,
  getFacetTermSortPriority,
  getFacetTermTranslations,
  getFacetTranslation,
  sortByActiveFacets,
} from "@/components/shared/searchFilters/helper"
import { cyKeys } from "@/cypress/support/constants"
import { SearchFacetFragment } from "@/lib/graphql/generated/fbi/graphql"
import { cn } from "@/lib/helpers/helper.cn"
import { TFilters } from "@/lib/machines/search/types"
import useSearchMachineActor from "@/lib/machines/search/useSearchMachineActor"

type SearchFiltersColumnProps = {
  facet: SearchFacetFragment
  isLast: boolean
}

type FacetValue = SearchFacetFragment["values"][number]

const COLLAPSED_COUNT = 3
const COLLAPSED_COUNT_WRAPPED = 8

const sortByPriority =
  (priority: string[]) =>
  (a: FacetValue, b: FacetValue): number =>
    priority.indexOf(a.term) - priority.indexOf(b.term)

const sortAlphabetically = (a: FacetValue, b: FacetValue): number =>
  a.term.localeCompare(b.term, "da", { numeric: true })

const facetTermTranslations = getFacetTermTranslations()

const facetSortStrategies: Partial<Record<string, (a: FacetValue, b: FacetValue) => number>> = {
  materialTypesSpecific: sortByPriority(getFacetTermSortPriority()),
  age: sortAlphabetically,
}

const SearchFiltersColumn = ({ facet, isLast }: SearchFiltersColumnProps) => {
  const actor = useSearchMachineActor()
  const [isExpanded, setIsExpanded] = useState<boolean>(false)
  const facetFilter = facet.name as keyof TFilters
  const { selectedFilters } = useSearchDataAndLoadingStates()
  const toggleFilter = createToggleFilterCallback(actor)
  const facetData = actor.getSnapshot().context.facetData

  // Filter out materialTypesSpecific terms that are not in the defined facet term map
  if (facet.name === "materialTypesSpecific") {
    facet.values = facet.values.filter(value => value.term in facetTermTranslations)
  }

  // Sort facet values using the facet-specific sort strategy if one exists
  const sortStrategy = facetSortStrategies[facet.name]
  if (sortStrategy) {
    facet.values = [...facet.values].sort(sortStrategy)
  }

  // We show the selected values first in the list
  if (selectedFilters) {
    facet.values = sortByActiveFacets(facet, selectedFilters)
  }

  const visibleCount = isLast ? COLLAPSED_COUNT_WRAPPED : COLLAPSED_COUNT
  const hasMore = facet.values.length > visibleCount
  const visibleValues = isExpanded ? facet.values : facet.values.slice(0, visibleCount)

  const firstRevealedRef = useRef<HTMLButtonElement | null>(null)
  const shouldFocusRevealed = useRef(false)

  const handleToggleExpand = useCallback(() => {
    setIsExpanded(prev => {
      if (!prev) {
        shouldFocusRevealed.current = true
      }
      return !prev
    })
  }, [])

  // Focus the first revealed badge button when the column is expanded
  useEffect(() => {
    if (shouldFocusRevealed.current && isExpanded && firstRevealedRef.current) {
      firstRevealedRef.current.focus()
      shouldFocusRevealed.current = false
    }
  }, [isExpanded])

  useEffect(() => {
    setIsExpanded(false)
  }, [facetData])

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

        <AnimateChangeInHeight>
          <div
            className={cn(
              "text-typo-caption mx-[-10px] mt-[-10px] flex gap-1 px-[10px] pt-[10px]",
              isLast ? "flex-row flex-wrap content-start" : "flex-col",
              isLast && !isExpanded && "max-h-[102px] overflow-hidden"
            )}>
            {visibleValues.map((value, index) => (
              <BadgeButton
                key={index}
                ref={index === visibleCount ? firstRevealedRef : undefined}
                ariaLabel={value.term}
                onClick={() => toggleFilter({ name: facet.name, value: value.term })}
                isActive={facetTermIsSelected({
                  facet: facet.name,
                  term: value.term,
                  filters: selectedFilters,
                })}
                withAnimation
                data-cy={cyKeys["filter-button"]}>
                {facet.name === "materialTypesSpecific"
                  ? facetTermTranslations[value.term]
                  : value.term}
              </BadgeButton>
            ))}
          </div>
          {hasMore && (
            <BadgeButton
              ariaLabel={isExpanded ? "Vis færre" : "Vis flere"}
              aria-expanded={isExpanded}
              classNames={cn(`pl-3 w-auto flex flex-row items-center self-start mt-1`)}
              onClick={handleToggleExpand}
              withAnimation>
              <Icon className={cn("h-8 w-8", isExpanded ? "rotate-180" : "")} name="arrow-down" />
              <p>{isExpanded ? "Skjul" : "Flere"}</p>
            </BadgeButton>
          )}
        </AnimateChangeInHeight>
      </div>
    </>
  )
}

export const SearchFiltersColumnSkeleton = () => {
  return (
    <div className="space-y-grid-gap-half">
      <div className="bg-background-skeleton mb-2.5 h-4 w-20 animate-pulse rounded-full"></div>
      <div className="space-y-1">
        <div className="bg-background-skeleton h-7 w-10 animate-pulse rounded-full"></div>
        <div className="bg-background-skeleton h-7 w-20 animate-pulse rounded-full"></div>
        <div className="bg-background-skeleton h-7 w-32 animate-pulse rounded-full"></div>
        <div className="bg-background-skeleton h-7 w-20 animate-pulse rounded-full"></div>
      </div>
    </div>
  )
}

export default SearchFiltersColumn
