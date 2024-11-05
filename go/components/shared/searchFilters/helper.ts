import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime"
import { ReadonlyURLSearchParams } from "next/navigation"

import goConfig from "@/lib/config/config"
import { TConfigSearchFacets } from "@/lib/config/resolvers/search"
import {
  FacetFieldEnum,
  SearchFacetFragment,
  SearchFiltersInput,
} from "@/lib/graphql/generated/fbi/graphql"

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

export const sortByActiveFacets = (
  facet: SearchFacetFragment,
  searchParams: ReadonlyURLSearchParams
) => {
  return [...facet.values].sort((a, b) => {
    const aIncluded = searchParams.getAll(facet.name).includes(a.term)
    const bIncluded = searchParams.getAll(facet.name).includes(b.term)
    if (aIncluded && !bIncluded) return -1
    if (!aIncluded && bIncluded) return 1
    return 0
  })
}

export const getFacetMachineNames = () => {
  const facets = goConfig<Record<string, unknown>>("search.facets")
  return Object.keys(facets) as FacetFieldEnum[]
}

export const getFacetTranslation = (facetFilter: keyof SearchFiltersInput) => {
  const facets = goConfig<TConfigSearchFacets>("search.facets")

  return facets[facetFilter.toUpperCase() as keyof TConfigSearchFacets].translation || ""
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
