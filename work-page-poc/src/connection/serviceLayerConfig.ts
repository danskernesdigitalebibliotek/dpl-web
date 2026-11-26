import type { ServiceLayerConfig } from "@danskernesdigitalebibliotek/dpl-service-layer"

import { type ConnectionSettings, getActiveToken, getConnectionSettings } from "./connectionSettings"

const biblioUrl = "https://biblio-adapter.dbc.dk"

/**
 * Points the service layer at the pasted urls and tokens. The resolvers read
 * the settings per request; the flags are fixed per config, so the caller
 * creates a new config when the settings change.
 */
export const createServiceLayerConfig = (settings: ConnectionSettings): ServiceLayerConfig => ({
  getBaseUrl: (api) => {
    const { fbsUrl, fbiUrl } = getConnectionSettings()
    return { fbs: fbsUrl, fbi: fbiUrl, biblio: biblioUrl }[api]
  },
  getAuthHeader: () => `Bearer ${getActiveToken(getConnectionSettings())}`,
  isPatronAuthenticated: Boolean(settings.userToken),
  canUseDigitalLoans: Boolean(settings.userToken),
})
