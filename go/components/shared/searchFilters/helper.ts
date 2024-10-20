import { FacetField, SearchFilters } from "@/lib/graphql/generated/fbi/graphql"
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime"

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

