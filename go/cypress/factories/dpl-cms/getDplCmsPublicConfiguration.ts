import { Factory } from "fishery"

import { TDplCmsPublicConfig } from "@/lib/config/dpl-cms/configSchemas"
import { GetDplCmsPublicConfigurationQuery } from "@/lib/graphql/generated/dpl-cms/graphql"

import defaultGoResponse from "./factory-parts/defaultGoResponse"

// A complete Biblio configuration for specs that switch the adapter on —
// useBiblioAdapter() requires flag, base url and SDK keys all present.
export const biblioEnabledConfig: TDplCmsPublicConfig["biblio"] = {
  enabled: true,
  baseUrl: "https://biblio-adapter.test",
  sdk: {
    applicationId: "test-app",
    firebaseApiKey: "test-firebase-api-key",
    firebaseProjectId: "test-firebase-project",
    firebaseAppId: "test-firebase-app",
    readerApiKey: "test-reader-api-key",
  },
}

export default Factory.define<
  GetDplCmsPublicConfigurationQuery,
  { appUrl?: string; biblio?: TDplCmsPublicConfig["biblio"] }
>(({ transientParams }) => {
  return {
    go: defaultGoResponse.build(),
    goConfiguration: {
      public: {
        loginUrls: {
          adgangsplatformen: "/mocked/login",
        },
        logoutUrls: {
          adgangsplatformen: "/mocked/logout",
        },
        libraryInfo: {
          name: "Test Library",
          baseURL: "https://dpl-biblioteket.test",
        },
        mapp: {
          domain: "responder.wt-safetag.com",
          id: "476651662471322",
        },
        unilogin: {
          municipalityId: "101",
        },
        blacklistedAvailabilityBranches: [],
        biblio: transientParams.biblio ?? { enabled: false, baseUrl: null, sdk: null },
      } satisfies TDplCmsPublicConfig,
    },
  }
})
