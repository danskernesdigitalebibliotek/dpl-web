import { Factory } from "fishery"

import { ComplexSearchForBookQuizQuery } from "@/lib/graphql/generated/fbi/graphql"

import { CombinedWorkFactory } from "./factory-parts/works"

type Params = {
  count: number
}

export default Factory.define<ComplexSearchForBookQuizQuery, Params>(({ transientParams }) => {
  const { count = 10 } = transientParams

  return {
    complexSearch: {
      works: CombinedWorkFactory.buildList(count),
    },
  }
})
