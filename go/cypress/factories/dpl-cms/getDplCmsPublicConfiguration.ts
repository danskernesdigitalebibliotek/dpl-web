import { Factory } from "fishery"

import { TDplCmsPublicConfig } from "@/lib/config/dpl-cms/dplCmsConfig"
import { GetDplCmsPublicConfigurationQuery } from "@/lib/graphql/generated/dpl-cms/graphql"

import defaultGoResponse from "./factory-parts/defaultGoResponse"

export default Factory.define<GetDplCmsPublicConfigurationQuery>(() => {
  return {
    go: defaultGoResponse.build(),
    goConfiguration: {
      public: {
        searchProfiles: {
          local: "next",
        },
        loginUrls: {
          adgangsplatformen: "/mocked/login",
        },
        logoutUrls: {
          adgangsplatformen: "/mocked/logout",
        },
        libraryInfo: {
          name: "Test Library",
        },
        unilogin: {
          municipalityId: "110",
        },
      } satisfies TDplCmsPublicConfig,
    },
  }
})
