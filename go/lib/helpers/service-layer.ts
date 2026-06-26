import type { ApiId, ServiceLayerConfig } from "@danskernesdigitalebibliotek/dpl-service-layer"

import { TServiceType, getAPServiceFetcherBaseUrl } from "./ap-service"

// Service-layer's ApiId is a subset of go's TServiceType — every ApiId we expose
// is also a registered AP service. Cast is safe by construction.
const apiIdToServiceType = (api: ApiId): TServiceType => api as TServiceType

// Server-side config (used during prefetch / session). The auth header is supplied
// synchronously because the access token is already in hand on the server.
export const getServiceLayerConfig = (accessToken: string): ServiceLayerConfig => ({
  getBaseUrl: api => getAPServiceFetcherBaseUrl(apiIdToServiceType(api)),
  getAuthHeader: () => `Bearer ${accessToken}`,
})
