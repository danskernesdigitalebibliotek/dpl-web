import { Factory } from "fishery"

import { GetLoginUrlsQuery } from "@/lib/graphql/generated/dpl-cms/graphql"

import defaultGoResponse from "./factory-parts/defaultGoResponse"

export default Factory.define<GetLoginUrlsQuery>(() => {
  return {
    go: defaultGoResponse.build(),
    goConfiguration: {
      public: {
        loginUrls: {
          adgangsplatformen: "/some-path",
        },
      },
    },
  }
})
