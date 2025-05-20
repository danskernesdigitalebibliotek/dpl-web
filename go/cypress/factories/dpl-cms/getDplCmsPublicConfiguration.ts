import { Factory } from "fishery"

import { GetDplCmsPublicConfigurationQuery } from "@/lib/graphql/generated/dpl-cms/graphql"

import defaultGoResponse from "./factory-parts/defaultGoResponse"

type Params = {
  appUrl: string
}
export default Factory.define<GetDplCmsPublicConfigurationQuery, Params>(({ transientParams }) => {
  const { appUrl } = transientParams

  return {
    go: defaultGoResponse.build(),
    goConfiguration: {
      public: {
        loginUrls: {
          adgangsplatformen: `${appUrl}/login?current-path=/go-login`,
        },
        logoutUrls: {
          adgangsplatformen: `${appUrl}/logout?current-path=/go-logout`,
        },
      },
    },
  }
})
