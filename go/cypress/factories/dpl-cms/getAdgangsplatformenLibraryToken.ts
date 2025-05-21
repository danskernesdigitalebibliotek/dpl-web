import dayjs from "dayjs"
import { Factory } from "fishery"

import { GetAdgangsplatformenLibraryTokenQuery } from "@/lib/graphql/generated/dpl-cms/graphql"

import defaultGoResponse from "./factory-parts/defaultGoResponse"

export default Factory.define<GetAdgangsplatformenLibraryTokenQuery>(() => {
  return {
    go: defaultGoResponse.build(),
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
  }
})
