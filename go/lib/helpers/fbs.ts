import { getPatron } from "@dpl/service-layer"

import { getAPServiceFetcherBaseUrl } from "./ap-service"

export const loadPatronServerSide = async (accessToken: string) =>
  getPatron({
    fbs: {
      baseUrl: getAPServiceFetcherBaseUrl("fbs"),
      getAuthHeader: () => `Bearer ${accessToken}`,
    },
  })
