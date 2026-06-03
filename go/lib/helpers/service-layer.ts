import { type FbsConfig, getPatron } from "@danskernesdigitalebibliotek/dpl-service-layer"

import { getSession } from "../session/session"
import { getAPServiceFetcherBaseUrl } from "./ap-service"

export const loadPatronServerSide = async (accessToken: string) =>
  getPatron({
    fbs: {
      baseUrl: getAPServiceFetcherBaseUrl("fbs"),
      getAuthHeader: () => `Bearer ${accessToken}`,
    },
  })

// Build an FbsConfig usable from server components / route handlers. Reads the
// user token from the session if logged in. Used by prefetch helpers.
export const getFbsConfigServer = async (): Promise<FbsConfig> => {
  const session = await getSession()
  const token = session?.adgangsplatformenUserToken ?? session?.adgangsplatformenLibraryToken
  return {
    baseUrl: getAPServiceFetcherBaseUrl("fbs"),
    getAuthHeader: () => (token ? `Bearer ${token}` : null),
  }
}

// Build an FbsConfig for client-side use. The /go ap-service proxy fills in
// auth from the session cookie when no Authorization header is set, so the
// client returns null to skip the header entirely.
export const getFbsConfigClient = (): FbsConfig => ({
  baseUrl: getAPServiceFetcherBaseUrl("fbs"),
  getAuthHeader: () => null,
})
