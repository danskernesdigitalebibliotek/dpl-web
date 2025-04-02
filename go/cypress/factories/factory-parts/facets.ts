import { Factory } from "fishery"

import { SearchFacetFragment } from "@/lib/graphql/generated/fbi/graphql"

type Facets = SearchFacetFragment

type Params = {
  name: string
  numValues: number
}

export const facetsFactory = Factory.define<Facets, Params>(({ transientParams }) => ({
  name: transientParams.name || "Facet name",
  values: facetValuesFactory.buildList(transientParams.numValues || 1),
}))

const facetValuesFactory = Factory.define<Facets["values"][0]>(({ sequence }) => ({
  key: `facet-key-${sequence}`,
  term: `Facet ${sequence}`,
  score: sequence * 10,
}))
