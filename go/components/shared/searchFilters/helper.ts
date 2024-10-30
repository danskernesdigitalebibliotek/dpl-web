import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime"

import { FacetFieldEnum, SearchFiltersInput } from "@/lib/graphql/generated/fbi/graphql"

export const facetDefinitions = [
  "MATERIALTYPESGENERAL",
  "MAINLANGUAGES",
  "AGE",
  "LIX",
  "SUBJECTS",
] as FacetFieldEnum[]

export const mapFacetsToFilters = {
  MATERIALTYPESGENERAL: "materialTypesGeneral",
  MAINLANGUAGES: "mainLanguages",
  AGE: "age",
  LIX: "lixRange",
  SUBJECTS: "subjects",
} as Record<FacetFieldEnum, keyof SearchFiltersInput>

export const mapFilterNameToTranslation: Partial<Record<keyof typeof mapFacetsToFilters, string>> =
  {
    MATERIALTYPESGENERAL: "Type",
    MAINLANGUAGES: "Sprog",
    AGE: "Alder",
    LIX: "Lix",
    SUBJECTS: "Emne",
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
