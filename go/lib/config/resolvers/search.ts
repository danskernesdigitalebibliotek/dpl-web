import { FacetFieldEnum } from "@/lib/graphql/generated/fbi/graphql"

export type TConfigSearchFacets = Record<FacetFieldEnum, { filter: string; translation: string }>

const search = {
  "search.item.limit": 12,
  "search.offset.initial": 0,
  "search.param.initial": 0,
  "search.facet.limit": 100,
  "search.facets": {
    MATERIALTYPESSPECIFIC: {
      filter: "materialTypesSpecific",
      translation: "Type",
    },
    MAINLANGUAGES: {
      filter: "mainLanguages",
      translation: "Sprog",
    },
    AGE: { filter: "age", translation: "Alder" },
    LIX: { filter: "lixRange", translation: "Lix" },
    SUBJECTS: { filter: "subjects", translation: "Emne" },
  } as TConfigSearchFacets,
}

export default search
