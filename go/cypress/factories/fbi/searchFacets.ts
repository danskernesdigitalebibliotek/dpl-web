import { Factory } from "fishery"

import { SearchFacetsQuery } from "@/lib/graphql/generated/fbi/graphql"

import { facetsFactory } from "./factory-parts/facets"

export default Factory.define<SearchFacetsQuery>(() => ({
  search: {
    facets: [
      facetsFactory.transient({ name: "materialTypesGeneral", numValues: 3 }).build(),
      facetsFactory.transient({ name: "mainLanguages", numValues: 2 }).build(),
      facetsFactory.transient({ name: "age", numValues: 10 }).build(),
      facetsFactory.transient({ name: "lix", numValues: 0 }).build(),
      facetsFactory.transient({ name: "subjects", numValues: 30 }).build(),
    ],
  },
}))
