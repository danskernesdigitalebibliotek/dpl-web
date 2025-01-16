import { Factory } from "fishery"

import { SearchWithPaginationQuery } from "@/lib/graphql/generated/fbi/graphql"

import { AudioBookFactory } from "./works"

export default Factory.define<SearchWithPaginationQuery>(() => ({
  search: {
    hitcount: 10,
    works: AudioBookFactory.buildList(10),
  },
}))
