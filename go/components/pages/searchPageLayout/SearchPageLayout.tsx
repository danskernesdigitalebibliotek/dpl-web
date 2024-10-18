"use client"

import { useSearchParams } from "next/navigation"
import { useEffect } from "react"

import {
  FacetField,
  FacetValue,
  useSearchFacetsQuery,
  useSearchWithPaginationQuery,
} from "@/lib/graphql/generated/fbi/graphql"

import SearchFilterBar from "./SearchFilterBar"

const facetDefinitions = [
  "materialTypesGeneral",
  "mainLanguages",
  "age",
  "lix",
  "subjects",
  "let",
] as FacetField[]

// TODO: Add branches through endpoint
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

export type FilterItemTerm = Omit<FacetValue, "__typename">

export const formatFacetTerms = (filters: { [key: string]: { [key: string]: FilterItemTerm } }) => {
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
    (acc, facetDefinition) => {
      const value = searchParams.get(facetDefinition)
      if (value) {
        return {
          ...acc,
          [facetDefinition]: [value],
        }
      }

      return acc
    },
    {} as { [key: string]: string[] }
  )

  const { data, error, isLoading } = useSearchWithPaginationQuery({
    q: { all: q },
    offset: 0,
    limit: 10,
    filters: {
      branchId: branchIds,
      ...facetsForSearchRequest,
    },
  })

  const {
    data: facetData,
    error: facetError,
    isLoading: facetIsLoading,
  } = useSearchFacetsQuery({
    q: { all: q },
    facetLimit: 100,
    facets: facetDefinitions,
    filters: {
      branchId: branchIds,
      ...facetsForSearchRequest,
    },
  })

  useEffect(() => {
    // const queryParams = new URLSearchParams(window.location.search);
  }, [searchParams])

  if (error) {
    return <div>Error: {<pre>{JSON.stringify(error, null, 2)}</pre>}</div>
  }

  return (
    <div className="content-container">
      <h1 className="mt-[88px] text-typo-heading-2">{`Viser resultater for "${q}" ${data?.search.hitcount ? "(" + data?.search.hitcount + ")" : ""}`}</h1>
      <SearchFilterBar facets={facetData?.search?.facets || []} />
      {isLoading && <p>isLoading...</p>}
      {data?.search.hitcount === 0 && <p>Ingen resultater</p>}
      <div className="grid grid-cols-3 gap-grid-gap-x">
        {data?.search?.hitcount &&
          data?.search?.hitcount > 0 &&
          data.search.works.map(work => (
            <div key={work.workId} className="bg-background-overlay p-4">
              <p>{work.titles.full}</p>

              <pre>{JSON.stringify(work, null, 2)}</pre>
            </div>
          ))}
      </div>

      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  )
}

export default SearchPageLayout
