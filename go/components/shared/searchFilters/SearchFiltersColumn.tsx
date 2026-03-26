import React, { useEffect, useRef, useState } from "react"

import { useSearchDataAndLoadingStates } from "@/components/pages/searchPageLayout/helper"
import { AnimateChangeInHeight } from "@/components/shared/animateChangeInHeight/AnimateChangeInHeight"
import BadgeButton from "@/components/shared/badge/BadgeButton"
import Icon from "@/components/shared/icon/Icon"
import {
  createToggleFilterCallback,
  facetTermIsSelected,
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

const materialTypeFacetsTranslations: Record<string, string> = {
  bog: "Bog",
  "e-bog": "E-bog",
  "graphic novel": "Graphic novel",
  "graphic novel (elektronisk)": "E-Graphic novel",
  "graphic novel (online)": "E-Graphic novel",
  tegneserie: "Tegneserie",
  "tegneserie (elektronisk)": "E-Tegneserie",
  "tegneserie (online)": "E-Tegneserie",
  billedbog: "Billedbog",
  "billedbog (elektronisk)": "E-Billedbog",
  "billedbog (online)": "E-Billedbog",
  "lydbog (online)": "E-Lydbog",
  podcast: "Podcast",
}

type FacetValue = SearchFacetFragment["values"][number]

const sortByPriority =
  (priority: string[]) =>
  (a: FacetValue, b: FacetValue): number =>
    priority.indexOf(a.term) - priority.indexOf(b.term)

const sortAlphabetically = (a: FacetValue, b: FacetValue): number =>
  a.term.localeCompare(b.term, "da", { numeric: true })

const facetSortStrategies: Partial<Record<string, (a: FacetValue, b: FacetValue) => number>> = {
  materialTypesSpecific: sortByPriority([
    "bog",
    "e-bog",
    "lydbog (online)",
    "podcast",
    "billedbog",
    "billedbog (elektronisk)",
    "billedbog (online)",
    "tegneserie",
    "tegneserie (elektronisk)",
    "tegneserie (online)",
    "graphic novel",
    "graphic novel (elektronisk)",
    "graphic novel (online)",
  ]),
  age: sortAlphabetically,
}

const SearchFiltersColumn = ({ facet, isLast }: SearchFiltersColumnProps) => {
  const actor = useSearchMachineActor()
  const [isExpanded, setIsExpanded] = useState<boolean>(false)
  const facetFilter = facet.name as keyof TFilters
  const elementRef = useRef<HTMLDivElement | null>(null)
  const [hasOverflow, setHasOverflow] = useState(false)
  const { selectedFilters } = useSearchDataAndLoadingStates()
  const toggleFilter = createToggleFilterCallback(actor)
  const facetData = actor.getSnapshot().context.facetData

  // Sort facet values using the facet-specific sort strategy if one exists
  const sortStrategy = facetSortStrategies[facet.name]
  if (sortStrategy) {
    facet.values = [...facet.values].sort(sortStrategy)
  }

  // We show the selected values first in the list
  if (selectedFilters) {
    facet.values = sortByActiveFacets(facet, selectedFilters)
  }

  useEffect(() => {
    const el = elementRef.current
    if (el) {
      const isOverflowing = el.scrollHeight > el.clientHeight

      if (isOverflowing) {
        setHasOverflow(true)
      } else {
        setHasOverflow(false)
      }
    }
  }, [elementRef?.current?.scrollHeight])

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

        <AnimateChangeInHeight className="overflow-visible">
          <div
            className={cn(
              "text-typo-caption mx-[-10px] mt-[-10px] flex gap-1 px-[10px] pt-[10px]",
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
                onClick={() => toggleFilter({ name: facet.name, value: value.term })}
                isActive={facetTermIsSelected({
                  facet: facet.name,
                  term: value.term,
                  filters: selectedFilters,
                })}
                withAnimation
                data-cy={cyKeys["filter-button"]}>
                {facet.name === "materialTypesSpecific"
                  ? materialTypeFacetsTranslations[value.term]
                  : value.term}
              </BadgeButton>
            ))}
          </div>
          {hasOverflow && (
            <BadgeButton
              ariaLabel={isExpanded ? "Vis færre" : "Vis flere"}
              classNames={cn(`pl-3 w-auto flex flex-row items-center self-start mt-1`)}
              onClick={() => {
                setIsExpanded(prev => !prev)
              }}
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
