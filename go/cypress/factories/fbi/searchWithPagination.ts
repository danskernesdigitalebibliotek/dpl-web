import { Factory } from "fishery"

import { SearchWithPaginationQuery } from "@/lib/graphql/generated/fbi/graphql"

import { CombinedWorkFactory } from "../factory-parts/works"

type Params = {
  hitcount: number
}

export default Factory.define<SearchWithPaginationQuery, Params>(({ transientParams }) => {
  const { hitcount = 10 } = transientParams

  return {
    search: {
      hitcount,
      works: CombinedWorkFactory.buildList(hitcount),
    },
  }
})
