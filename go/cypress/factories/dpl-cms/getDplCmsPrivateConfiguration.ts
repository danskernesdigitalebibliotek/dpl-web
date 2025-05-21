import { Factory } from "fishery"

import { GetDplCmsPrivateConfigurationQuery } from "@/lib/graphql/generated/dpl-cms/graphql"

import defaultGoResponse from "./factory-parts/defaultGoResponse"

export default Factory.define<GetDplCmsPrivateConfigurationQuery>(() => {
  return {
    go: defaultGoResponse.build(),
    goConfiguration: {
      private: {
        unilogin: {
          unilogin_api_client_id: "mocked-client-id",
          unilogin_api_client_secret: "mocked-client-secret",
          unilogin_api_url: "mocked-api-url",
          unilogin_api_wellknown_url: "mocked-wellknown-url",
        },
      },
    },
  }
})
