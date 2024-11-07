import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime"
import { ReadonlyURLSearchParams } from "next/navigation"

import goConfig from "@/lib/config/config"
import { TConfigSearchFacets } from "@/lib/config/resolvers/search"
import {
  FacetFieldEnum,
  HoldingsStatusEnum,
  SearchFacetFragment,
  SearchFiltersInput,
} from "@/lib/graphql/generated/fbi/graphql"
import { TContext, TFilters } from "@/lib/machines/search/types"

export const toggleFilter = (filterName: string, value: string, router: AppRouterInstance) => {
  const searchParams = new URLSearchParams(window.location.search)

  if (searchParams.has(filterName)) {
    const filterValues = [...searchParams.getAll(filterName)]
    searchParams.delete(filterName)

    if (filterValues.includes(value)) {
      filterValues.splice(filterValues.indexOf(value), 1)
    } else {
      filterValues.push(value)
    }
    filterValues.forEach(filterValue => {
      searchParams.append(filterName, filterValue)
    })
  } else {
    searchParams.append(filterName, value)
  }
  const searchParamsString = searchParams.toString()
  router.push("/search" + searchParamsString ? `?${searchParamsString}` : "", { scroll: false })
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
  const facets = goConfig<Record<string, unknown>>("search.facets")
  return Object.keys(facets) as FacetFieldEnum[]
}

export const getFacetTranslation = (facetFilter: keyof TFilters) => {
  const facets = goConfig<TConfigSearchFacets>("search.facets")
  for (const [, facet] of Object.entries(facets)) {
    if (facet.filter === facetFilter) {
      return facet.translation
    }
  }

  return null
}

export const facetTermIsSelected = ({
  filters,
  facet,
  term,
}: {
  filters: TContext["selectedFilters"]
  facet: string
  term: string
}) => {
  // console.debug(filters[facet as keyof TContext["selectedFilters"]]?.includes(term))
  // Fix type problem here
  // @ts-ignore
  return Boolean(filters[facet as keyof TContext["selectedFilters"]]?.includes(term))
}
