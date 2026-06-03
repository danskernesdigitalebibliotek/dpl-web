import type { Availability, Patron } from "../../src/types"
import { getGetAvailabilityV3Url, getGetPatronInformationByPatronIdV4Url } from "./generated/fbs"
import { parseAndMapAvailability } from "./mappers/availability.mapper"
import { parseAndMapPatron } from "./mappers/patron.mapper"
import type { FbsConfig } from "./types"

export type GetAvailabilityArgs = {
  faustIds: string[]
  excludeBranches?: string[]
}

// Resolve the configured auth header value and build the headers map. `null`
// means "do not set Authorization" (proxy-fronted setups). Empty string is
// rejected so a forgetful caller fails fast instead of silently sending no
// auth and getting back 401s.
async function buildAuthHeaders(
  getAuthHeader: FbsConfig["getAuthHeader"]
): Promise<Record<string, string>> {
  const value = await getAuthHeader()
  if (value === null) return {}
  if (value === "") {
    throw new Error(
      "FbsConfig.getAuthHeader returned an empty string. Return `null` to skip the Authorization header, or a non-empty value like 'Bearer ...'."
    )
  }
  return { authorization: value }
}

function resolveBaseUrl(baseUrl: FbsConfig["baseUrl"]): string {
  return typeof baseUrl === "function" ? baseUrl() : baseUrl
}

// FBS paths come from the orval-generated URL helpers — never spell out a
// route string by hand here. The generated helpers handle querystring
// encoding, array-explode params (e.g. repeated `recordid`), etc.
async function fbsFetch(
  config: FbsConfig,
  endpoint: { path: string; operation: string }
): Promise<unknown> {
  const response = await fetch(`${resolveBaseUrl(config.baseUrl)}${endpoint.path}`, {
    method: "GET",
    headers: await buildAuthHeaders(config.getAuthHeader),
  })
  if (!response.ok) {
    throw new Error(`FBS ${endpoint.operation} failed: ${response.status} ${response.statusText}`)
  }
  return response.json()
}

export function createFbsClient(config: FbsConfig) {
  return {
    getPatron: async (): Promise<Patron | undefined> => {
      const raw = await fbsFetch(config, {
        path: getGetPatronInformationByPatronIdV4Url(),
        operation: "getPatron",
      })
      return parseAndMapPatron(raw)
    },

    getAvailability: async ({
      faustIds,
      excludeBranches = [],
    }: GetAvailabilityArgs): Promise<Availability[]> => {
      if (faustIds.length === 0) return []
      const raw = await fbsFetch(config, {
        path: getGetAvailabilityV3Url({ recordid: faustIds, exclude: excludeBranches }),
        operation: "getAvailability",
      })
      return parseAndMapAvailability(raw)
    },
  }
}
