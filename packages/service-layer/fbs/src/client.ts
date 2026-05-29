import type { Patron } from "../../src/types"
import { parseAndMapPatron } from "./mappers/patron.mapper"
import type { FbsConfig } from "./types"

export function createFbsClient(config: FbsConfig) {
  return {
    getPatron: async (): Promise<Patron | undefined> => {
      const authHeader = await config.getAuthHeader()
      const response = await fetch(`${config.baseUrl}/external/agencyid/patrons/patronid/v4`, {
        method: "GET",
        headers: { authorization: authHeader },
      })
      if (!response.ok) {
        throw new Error(`FBS getPatron failed: ${response.status} ${response.statusText}`)
      }
      const raw: unknown = await response.json()
      return parseAndMapPatron(raw)
    },
  }
}
