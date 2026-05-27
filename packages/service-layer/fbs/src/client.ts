import type { AuthenticatedPatron } from "../../src/types"
import { parseAndMapAuthenticatedPatron } from "./mappers/patron.mapper"
import type { FbsConfig } from "./types"

export function createFbsClient(config: FbsConfig) {
  return {
    getPatron: async (): Promise<AuthenticatedPatron> => {
      const authHeader = await config.getAuthHeader()
      const response = await fetch(`${config.baseUrl}/external/agencyid/patrons/patronid/v4`, {
        method: "GET",
        headers: { authorization: authHeader },
      })
      if (!response.ok) {
        throw new Error(`FBS getPatron failed: ${response.status} ${response.statusText}`)
      }
      const raw: unknown = await response.json()
      return parseAndMapAuthenticatedPatron(raw)
    },
  }
}
