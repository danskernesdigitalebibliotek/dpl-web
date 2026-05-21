import type { AuthenticatedPatronV8 } from "./generated/model/authenticatedPatronV8"
import { mapAuthenticatedPatron } from "./mappers/patron.mapper"
import type { AuthenticatedPatronInfo, FbsFetcherConfig } from "./types"

export function createFbsClient(config: FbsFetcherConfig) {
  return {
    getPatronInfo: async (): Promise<AuthenticatedPatronInfo> => {
      const authHeader = await config.getAuthHeader()
      const response = await fetch(
        `${config.baseUrl}/external/agencyid/patrons/patronid/v4`,
        {
          method: "GET",
          headers: authHeader ? { authorization: authHeader } : {},
        }
      )
      const raw = (await response.json()) as AuthenticatedPatronV8
      return mapAuthenticatedPatron(raw)
    },
  }
}
