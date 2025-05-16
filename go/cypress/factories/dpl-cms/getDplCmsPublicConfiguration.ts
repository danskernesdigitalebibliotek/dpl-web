import { Factory } from "fishery"

import { GetDplCmsPublicConfigurationQuery } from "@/lib/graphql/generated/dpl-cms/graphql"

type Params = {
  appUrl: string
}
export default Factory.define<GetDplCmsPublicConfigurationQuery, Params>(({ transientParams }) => {
  const { appUrl } = transientParams

  return {
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
