import React from "react"

import { useSearchDataAndLoadingStates } from "@/components/pages/searchPageLayout/helper"
import BadgeButton from "@/components/shared/badge/BadgeButton"
import Icon from "@/components/shared/icon/Icon"
import { createToggleFilterCallback } from "@/components/shared/searchFilters/helper"
import { SearchFacetFragment } from "@/lib/graphql/generated/fbi/graphql"
import { TFilters } from "@/lib/machines/search/types"
import useSearchMachineActor from "@/lib/machines/search/useSearchMachineActor"
import { useSheetStore } from "@/store/sheet.store"

import { Button } from "../button/Button"

type SearchFiltersMobileProps = {
  facets: SearchFacetFragment[]
}

const SearchFiltersMobile = ({ facets }: SearchFiltersMobileProps) => {
  const { selectedFilters } = useSearchDataAndLoadingStates()
  const actor = useSearchMachineActor()
  const toggleFilter = createToggleFilterCallback(actor)

  const sheetStore = useSheetStore()

  return (
    <div className="space-y-grid-gap">
      {/* Show currently selected filters */}
      {selectedFilters && (
        <div className="space-y-grid-gap">
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
        </div>
      )}
      <Button
        aria-label="Vis filtreringsmuligheder"
        onClick={() =>
          sheetStore.openSheet({
            sheetType: "SearchFilterSheet",
            props: { facets: facets },
          })
        }
        className="text-typo-link flex flex-row items-center gap-1">
        <Icon name="adjust" className="h-[40px]" />
        VIS FILTRE
      </Button>
    </div>
  )
}

export default SearchFiltersMobile
