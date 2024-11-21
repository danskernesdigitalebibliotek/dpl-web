import { flatten } from "lodash"
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime"
import { ReadonlyURLSearchParams } from "next/navigation"

import goConfig from "@/lib/config/config"
import { FacetFieldEnum, SearchFacetFragment } from "@/lib/graphql/generated/fbi/graphql"
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
  const facets = goConfig("search.facets")
  return Object.keys(facets) as FacetFieldEnum[]
}

export const getFacetTranslation = (facetFilter: keyof TFilters) => {
  const facets = goConfig("search.facets")

  return facets[facetFilter.toUpperCase() as keyof typeof facets].translation || ""
}

export const getActiveFilters = (
  allFacets: SearchFacetFragment[],
  searchParams: ReadonlyURLSearchParams
) => {
  const filteredActive = allFacets.map(facet => {
    const searchFacet = { ...facet }
    searchFacet.values = searchFacet.values.filter(value => {
      return searchParams.getAll(facet.name).includes(value.term)
    })
    return searchFacet
  })
  return filteredActive
}

export const shouldShowActiveFilters = (
  facets: SearchFacetFragment[],
  searchParams: ReadonlyURLSearchParams
) => {
  return flatten(getActiveFilters(facets, searchParams).map(filter => filter.values)).length > 0
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
