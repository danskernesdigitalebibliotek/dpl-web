import { useSearchParams } from "next/navigation"
import React, { useState } from "react"

import { useSearchDataAndLoadingStates } from "@/components/pages/searchPageLayout/helper"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/shared/accordion/Accordion"
import BadgeButton from "@/components/shared/badge/BadgeButton"
import Icon from "@/components/shared/icon/Icon"
import {
  createToggleFilterCallback,
  getFacetTranslation,
} from "@/components/shared/searchFilters/helper"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/shared/sheet/Sheet"
import { SearchFacetFragment } from "@/lib/graphql/generated/fbi/graphql"
import { TFilters } from "@/lib/machines/search/types"
import useSearchMachineActor from "@/lib/machines/search/useSearchMachineActor"

import { Button } from "../button/Button"

type SearchFiltersMobileProps = {
  facets: SearchFacetFragment[]
}

const SearchFiltersMobile = ({ facets }: SearchFiltersMobileProps) => {
  const searchParams = useSearchParams()
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const { selectedFilters } = useSearchDataAndLoadingStates()
  const actor = useSearchMachineActor()
  const toggleFilter = createToggleFilterCallback(actor)

  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <div className="space-y-grid-gap">
        <SheetTrigger
          aria-label="Vis filtreringsmuligheder"
          onClick={() => setIsSheetOpen(!isSheetOpen)}
          className="flex flex-row items-center gap-1 text-typo-link">
          <Button asChild ariaLabel="VIS FILTRE">
            <div>
              <Icon name="adjust" className="h-[40px]" />
              VIS FILTRE
            </div>
          </Button>
        </SheetTrigger>

        {/* Show currently selected filters */}
        {selectedFilters && (
          <div className="flex flex-row flex-wrap gap-1">
            {Object.keys(selectedFilters).map(facet => {
              const facetName = facet as keyof TFilters
              return selectedFilters[facetName]?.map(value => {
                return (
                  <BadgeButton
                    onClick={() => toggleFilter({ name: facetName, value })}
                    key={value}
                    ariaLabel={value}
                    isActive
                    classNames="flex flex-row items-center pr-1">
                    {value}
                    <Icon name="close" className="w-[25px]" />
                  </BadgeButton>
                )
              })
            })}
          </div>
        )}
      </div>

      <SheetContent className="p-grid-edge" side="bottom">
        <SheetHeader>
          <SheetTitle className="mb-space-y text-typo-heading-3">Filtre</SheetTitle>
          <div className="-mx-grid-edge">
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
                            toggleFilter({ name: facet.name, value: value.term })
                          }}
                          isActive={!!searchParams.getAll(facet.name).includes(value.term)}
                          key={index}
                          ariaLabel={value.term}>
                          {value.term}
                        </BadgeButton>
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                )
              })}
            </Accordion>
          </div>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  )
}

export default SearchFiltersMobile
