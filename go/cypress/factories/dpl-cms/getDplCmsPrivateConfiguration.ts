import { Factory } from "fishery"

import { GetDplCmsPrivateConfigurationQuery } from "@/lib/graphql/generated/dpl-cms/graphql"

import defaultGoResponse from "./factory-parts/defaultGoResponse"

export default Factory.define<GetDplCmsPrivateConfigurationQuery>(() => {
  return {
    go: defaultGoResponse.build(),
    goConfiguration: {
      private: {
        unilogin: {
          clientSecret: "mocked-client-secret",
          pubHubRetailerKeyCode: "mocked-retailer-key-code",
        },
      },
    },
  }
})
