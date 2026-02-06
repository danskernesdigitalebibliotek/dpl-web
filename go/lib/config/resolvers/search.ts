import { FacetFieldEnum } from "@/lib/graphql/generated/fbi/graphql"

export type TConfigSearchFacets = Record<FacetFieldEnum, { filter: string; translation: string }>

const search = {
  "search.item.limit": 12,
  "search.offset.initial": 0,
  "search.param.initial": 0,
  "search.facet.limit": 100,
  // TODO: Add branches though endpoint
  "search.branch.ids": [
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
  ],
  "search.facets": {
    MATERIALTYPESGENERAL: {
      filter: "materialTypesGeneral",
      translation: "Type",
    },
    // Keep this for debugging purposes. TODO: Remove this when not needed.
    // MATERIALTYPESSPECIFIC: {
    //   filter: "materialTypesSpecific",
    //   translation: "Type",
    // },
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
