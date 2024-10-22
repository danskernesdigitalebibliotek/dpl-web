"use client"

import { useSearchParams } from "next/navigation"

import { facetDefinitions, mapFacetsToFilters } from "@/components/shared/searchFilters/helper"
import {
  FacetValue,
  SearchFilters,
  useSearchFacetsQuery,
  useSearchWithPaginationQuery,
} from "@/lib/graphql/generated/fbi/graphql"

import SearchFilterBar from "../../shared/searchFilters/SearchFilterBar"
import SearchResults from "./SearchResults"

// TODO: Add branches though endpoint
const branchIds = [
  "775120",
  "775122",
  "775144",
  "775167",
  "775146",
  "775168",
  "751010",
  "775147",
  "751032",
  "751031",
  "775126",
  "751030",
  "775149",
  "775127",
  "775160",
  "775162",
  "775140",
  "751009",
  "751029",
  "751027",
  "751026",
  "751025",
  "775133",
  "751024",
  "775100",
  "775170",
  "775150",
  "775130",
] as string[]

export const formatFacetTerms = (filters: { [key: string]: { [key: string]: FacetValue } }) => {
  return Object.keys(filters).reduce(
    (acc, key) => ({
      ...acc,
      [key]: Object.keys(filters[key]),
    }),
    {}
  )
}

const SearchPageLayout = ({ searchQuery }: { searchQuery?: string }) => {
  const searchParams = useSearchParams()
  const q = searchQuery || searchParams.get("q") || ""
  const facetsForSearchRequest = facetDefinitions.reduce(
    (acc: SearchFilters, facetDefinition) => {
      const values = searchParams.getAll(facetDefinition)
      if (values.length > 0) {
        return {
          ...acc,
          [mapFacetsToFilters[facetDefinition]]: [...values],
        }
      }
      return acc
    },
    {} as { [key: string]: keyof SearchFilters[] }
  )

  const { data, isLoading } = useSearchWithPaginationQuery(
    {
      q: { all: q },
      offset: 0,
      // TODO: This should be configurable.
      limit: 10,
      filters: {
        branchId: branchIds,
        ...facetsForSearchRequest,
      },
    },
    {
      enabled: q?.length > 0,
    }
  )

  const { data: dataFacets, isLoading: isLoadingFacets } = useSearchFacetsQuery(
    {
      q: { all: q },
      facetLimit: 100,
      facets: facetDefinitions,
      filters: {
        branchId: branchIds,
        ...facetsForSearchRequest,
      },
    },
    {
      enabled: q?.length > 0,
    }
  )

  const facetData = dataFacets?.search?.facets
  const searchData = data?.search

  return (
    <div className="content-container">
      <h1 className="mt-[88px] text-typo-heading-2">
        {`Viser resultater for "${q}" ${data?.search.hitcount ? "(" + data?.search.hitcount + ")" : ""}`}
      </h1>
      {isLoadingFacets && <p>isLoadingFacets...</p>}
      {!facetData?.length && <p>Ingen filter</p>}
      {facetData && facetData?.length > 0 && <SearchFilterBar facets={dataFacets.search.facets} />}
      {isLoading && <p>isLoading...</p>}
      {searchData?.hitcount === 0 && <p>Ingen søgeresultat</p>}
      {searchData?.works && <SearchResults works={searchData.works} />}
    </div>
  )
}

export default SearchPageLayout
