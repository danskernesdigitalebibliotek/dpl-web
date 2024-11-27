import { GetNextPageParamFunction } from "@tanstack/react-query"
import { useSelector } from "@xstate/react"
import { ReadonlyURLSearchParams } from "next/navigation"

import { getFacetMachineNames } from "@/components/shared/searchFilters/helper"
import goConfig from "@/lib/config/goConfig"
import { TFilters } from "@/lib/machines/search/types"
import useSearchMachineActor from "@/lib/machines/search/useSearchMachineActor"

export const getFacetsForSearchRequest = (searchParams: ReadonlyURLSearchParams) => {
  const facets = goConfig("search.facets")
  const facetsMachineNames = getFacetMachineNames()

  return facetsMachineNames.reduce(
    (acc: TFilters, machineName) => {
      const values = searchParams.getAll(facets[machineName as keyof typeof facets].filter)
      if (values.length > 0) {
        return {
          ...acc,
          [facets[machineName as keyof typeof facets].filter]: [...values],
        }
      }
      return acc
    },
    {} as { [key: string]: keyof TFilters[] }
  )
}

export const useSearchDataAndLoadingStates = () => {
  const actor = useSearchMachineActor()
  const searchQuery = useSelector(actor, snapshot => {
    return snapshot.context.submittedQuery
  })
  const data = useSelector(actor, snapshot => {
    const { facetData: facets, searchData: search } = snapshot.context
    return { facets, search }
  })
  const isLoadingFacets =
    !data.facets || actor.getSnapshot().matches({ filteringAndSearching: "filter" })
  const isLoadingResults = actor.getSnapshot().matches({ filteringAndSearching: "search" })
  const isLoadingMoreResults = actor
    .getSnapshot()
    .matches({ loadingMoreSearchResults: "searching" })
  const machineIsReady = !actor.getSnapshot().matches("bootstrap")

  const selectedFilters = useSelector(actor, snapshot => snapshot.context.selectedFilters)

  return {
    searchQuery,
    data,
    selectedFilters,
    isLoadingFacets,
    isLoadingResults,
    isLoadingMoreResults,
    machineIsReady,
  }
}
