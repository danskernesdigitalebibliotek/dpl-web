import { createFbsClient } from "@dpl/fbs"

import { getAPServiceFetcherBaseUrl } from "./ap-service"

export const loadPatronServerSide = async (accessToken: string) => {
  const client = createFbsClient({
    baseUrl: getAPServiceFetcherBaseUrl("fbs"),
    getAuthHeader: () => `Bearer ${accessToken}`,
  })
  return client.getPatronInfo()
}
