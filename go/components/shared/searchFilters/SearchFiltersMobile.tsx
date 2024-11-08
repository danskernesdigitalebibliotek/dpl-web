import { useRouter, useSearchParams } from "next/navigation"
import React, { useState } from "react"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/accordion/Accordion"
import BadgeButton from "@/components/shared/badge/BadgeButton"
import Icon from "@/components/shared/icon/Icon"
import {
  getActiveFilters,
  getFacetTranslation,
  shouldShowActiveFilters,
  toggleFilter,
} from "@/components/shared/searchFilters/helper"
import { Sheet, SheetContent, SheetTrigger } from "@/components/shared/sheet/Sheet"
import { SearchFacetFragment } from "@/lib/graphql/generated/fbi/graphql"
import { TFilters } from "@/lib/machines/search/types"

type SearchFiltersMobileProps = {
  facets: SearchFacetFragment[]
}

const SearchFiltersMobile = ({ facets }: SearchFiltersMobileProps) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <SheetTrigger
        aria-label="Vis filtreringsmuligheder"
        onClick={() => setIsSheetOpen(!isSheetOpen)}
        className="flex flex-row items-center gap-1 pr-4 text-typo-link hover:bg-background-overlay">
        <Icon name="adjust" className="h-[40px]" />
        VIS FILTRE
      </SheetTrigger>

      {/* Show currently selected filters */}
      {shouldShowActiveFilters(facets, searchParams) && (
        <div className="flex flex-row flex-wrap gap-1 pt-2">
          {getActiveFilters(facets, searchParams).map(facet => {
            return facet.values.map(value => {
              return (
                <BadgeButton
                  onClick={() => {
                    toggleFilter(facet.name, value.term, router)
                  }}
                  key={value.term}
                  isActive
                  classNames="flex flex-row items-center pr-1">
                  {value.term}
                  <Icon name="close" className="w-[25px]" />
                </BadgeButton>
              )
            })
          })}
        </div>
      )}

      <SheetContent className="w-full p-grid-edge pt-20" side="bottom">
        <Accordion type="multiple" defaultValue={facets.map(facet => facet.name)}>
          {facets.map(facet => {
            const facetName = facet.name as keyof TFilters
            return (
              <AccordionItem key={facetName} value={facetName}>
                <AccordionTrigger>{getFacetTranslation(facetName)}</AccordionTrigger>
                <AccordionContent className="flex flex-wrap gap-1">
                  {facet.values.map((value, index) => (
                    <BadgeButton
                      onClick={() => {
                        setIsSheetOpen(false)
                        toggleFilter(facet.name, value.term, router)
                      }}
                      isActive={!!searchParams.getAll(facet.name).includes(value.term)}
                      key={index}>
                      {value.term}
                    </BadgeButton>
                  ))}
                </AccordionContent>
              </AccordionItem>
            )
          })}
        </Accordion>
      </SheetContent>
    </Sheet>
  )
}

export default SearchFiltersMobile
