import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime"

import { FacetField, SearchFilters } from "@/lib/graphql/generated/fbi/graphql"

export const facetDefinitions = [
  "materialTypesGeneral",
  "mainLanguages",
  "age",
  "lix",
  "subjects",
] as FacetField[]

export const mapFacetsToFilters = {
  materialTypesGeneral: "materialTypesGeneral",
  mainLanguages: "mainLanguages",
  age: "age",
  lix: "lixRange",
  subjects: "subjects",
} as Record<FacetField, keyof SearchFilters>

export const mapFilterNameToTranslation: Partial<Record<keyof typeof mapFacetsToFilters, string>> =
  {
    materialTypesGeneral: "Type",
    mainLanguages: "Sprog",
    age: "Alder",
    lix: "Lix",
    subjects: "Emne",
  }

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
