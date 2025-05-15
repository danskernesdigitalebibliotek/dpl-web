import dayjs from "dayjs"
import { Factory } from "fishery"

import { GetAdgangsplatformenLibraryTokenQuery } from "@/lib/graphql/generated/dpl-cms/graphql"

export default Factory.define<GetAdgangsplatformenLibraryTokenQuery>(() => {
  return {
    dplTokens: {
      adgangsplatformen: {
        library: {
          token: "library-token",
          expire: {
            timestamp: dayjs().add(1, "day").unix(),
          },
        },
      },
    },
    go: {
      cacheTags: [],
    },
  }
})
