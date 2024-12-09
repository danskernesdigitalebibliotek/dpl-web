import { AnyActor, AnyEventObject } from "xstate"

import goConfig from "@/lib/config/goConfig"
import { FacetFieldEnum, SearchFacetFragment } from "@/lib/graphql/generated/fbi/graphql"
import { TContext, TFilters } from "@/lib/machines/search/types"

export const createToggleFilterCallback =
  (actor: AnyActor) =>
  ({ name, value }: { name: string; value: string }) => {
    actor.send({ type: "TOGGLE_FILTER", name, value } as AnyEventObject)
  }

export const sortByActiveFacets = (facet: SearchFacetFragment, selectedFilters: TFilters) => {
  return [...facet.values].sort((a, b) => {
    const facetName = facet.name as keyof TFilters
    if (!selectedFilters[facetName]) {
      return 0
    }
    const aIncluded = selectedFilters[facetName].includes(a.term)
    const bIncluded = selectedFilters[facetName].includes(b.term)
    if (aIncluded && !bIncluded) return -1
    if (!aIncluded && bIncluded) return 1
    return 0
  })
}

export const getFacetMachineNames = () => {
  const facets = goConfig("search.facets")
  return Object.keys(facets) as FacetFieldEnum[]
}

export const getFacetTranslation = (facetFilter: keyof TFilters) => {
  const facetsConfig = Object.values(goConfig("search.facets"))
  const translation = facetsConfig.find(facet => facet.filter === facetFilter)?.translation
  return translation || ""
}

export const facetTermIsSelected = ({
  filters,
  facet,
  term,
}: {
  filters: TContext["selectedFilters"]
  facet: string
  term: string
}) => Boolean(filters[facet as keyof TContext["selectedFilters"]]?.includes(term))
