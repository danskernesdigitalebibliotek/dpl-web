"use client"

import { useSearchParams } from "next/navigation"
import React from "react"

import { cyKeys } from "@/cypress/support/constants"
import { SearchFacetFragment } from "@/lib/graphql/generated/fbi/graphql"
import { TFilters } from "@/lib/machines/search/types"
import useSearchMachineActor from "@/lib/machines/search/useSearchMachineActor"
import { sheetStore } from "@/store/sheet.store"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../accordion/Accordion"
import BadgeButton from "../badge/BadgeButton"
import { createToggleFilterCallback, getFacetTranslation } from "../searchFilters/helper"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "./Sheet"

function SearchFilterSheet(props: { open: boolean; facets: SearchFacetFragment[] }) {
  const open = props.open
  const facets = props.facets

  const searchParams = useSearchParams()
  const actor = useSearchMachineActor()
  const toggleFilter = createToggleFilterCallback(actor)

  const { closeSheet } = sheetStore.trigger

  return (
    <Sheet open={open} onOpenChange={(open: boolean) => (open ? null : closeSheet())}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle className="mb-space-y text-typo-heading-3">Filtre</SheetTitle>
        </SheetHeader>
        <SheetDescription asChild>
          <div className="-mx-grid-edge lg:-mx-8">
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
                            closeSheet()
                            toggleFilter({ name: facet.name, value: value.term })
                          }}
                          isActive={!!searchParams.getAll(facet.name).includes(value.term)}
                          key={index}
                          ariaLabel={value.term}
                          data-cy={cyKeys["filter-button"]}>
                          {value.term}
                        </BadgeButton>
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                )
              })}
            </Accordion>
          </div>
        </SheetDescription>
      </SheetContent>
    </Sheet>
  )
}

export default SearchFilterSheet
