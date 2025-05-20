import { Factory } from "fishery"

import { Query } from "@/lib/graphql/generated/dpl-cms/graphql"

// Default response which must be a part of every dpl-cms graphql query response
export default Factory.define<Query["go"]>(() => ({
  cacheTags: [],
}))
