import { Factory } from "fishery"

import { SearchFacetsQuery } from "@/lib/graphql/generated/fbi/graphql"

import { facetsFactory } from "./factory-parts/facets"

export default Factory.define<SearchFacetsQuery>(() => ({
  search: {
    facets: [
      facetsFactory.build({}, { transient: { name: "materialTypesGeneral", numValues: 3 } }),
      facetsFactory.build({}, { transient: { name: "mainLanguages", numValues: 2 } }),
      facetsFactory.build({}, { transient: { name: "age", numValues: 10 } }),
      facetsFactory.build({}, { transient: { name: "lix", numValues: 0 } }),
      facetsFactory.build({}, { transient: { name: "subjects", numValues: 30 } }),
    ],
  },
}))
