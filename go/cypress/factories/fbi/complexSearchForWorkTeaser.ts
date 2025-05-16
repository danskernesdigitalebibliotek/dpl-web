import { Factory } from "fishery"

import { ComplexSearchForWorkTeaserQuery } from "@/lib/graphql/generated/fbi/graphql"

import { CombinedWorkFactory } from "./factory-parts/works"

type Params = {
  hitcount: number
}

export default Factory.define<ComplexSearchForWorkTeaserQuery, Params>(({ transientParams }) => {
  const { hitcount = 6 } = transientParams

  return {
    complexSearch: {
      hitcount,
      works: CombinedWorkFactory.buildList(hitcount),
    },
  }
})
