import { useSelector } from "@xstate/react"

import useSearchMachineActor from "@/lib/machines/search/useSearchMachineActor"

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
