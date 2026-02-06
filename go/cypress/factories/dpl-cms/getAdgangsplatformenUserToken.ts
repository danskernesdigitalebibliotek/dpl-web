import dayjs from "dayjs"
import { Factory } from "fishery"

import { GetAdgangsplatformenUserTokenQuery } from "@/lib/graphql/generated/dpl-cms/graphql"

import defaultGoResponse from "./factory-parts/defaultGoResponse"

export default Factory.define<GetAdgangsplatformenUserTokenQuery>(() => {
  return {
    go: defaultGoResponse.build(),
    dplTokens: {
      adgangsplatformen: {
        user: {
          token: "user-token",
          expire: {
            timestamp: dayjs().add(1, "day").unix(),
          },
        },
      },
    },
  }
})
