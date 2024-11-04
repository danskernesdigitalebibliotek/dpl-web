import { FacetFieldEnum } from "@/lib/graphql/generated/fbi/graphql"

const search = {
  "search.item.limit": 18,
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
    [FacetFieldEnum.Materialtypesgeneral]: {
      filter: "materialTypesGeneral",
      translation: "Type",
    },
    [FacetFieldEnum.Mainlanguages]: {
      filter: "mainLanguages",
      translation: "Sprog",
    },
    [FacetFieldEnum.Age]: { filter: "age", translation: "Alder" },
    [FacetFieldEnum.Lix]: { filter: "lixRange", translation: "Lix" },
    [FacetFieldEnum.Subjects]: { filter: "subjects", translation: "Emne" },
  },
}

export type TConfigSearchFacets = Record<FacetFieldEnum, { filter: string; translation: string }>

export default search
