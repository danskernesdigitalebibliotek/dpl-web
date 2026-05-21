import type { AuthenticatedPatronInfo } from "../../src/types"
import type { AuthenticatedPatronV8 } from "./generated/model/authenticatedPatronV8"
import { AuthenticatedPatronV8AuthenticateStatus } from "./generated/model/authenticatedPatronV8AuthenticateStatus"
import { mapAuthenticatedPatron } from "./mappers/patron.mapper"
import type { FbsConfig } from "./types"

const FBS_AUTH_STATUSES = Object.values(AuthenticatedPatronV8AuthenticateStatus)

export function isAuthenticatedPatronV8(
  value: unknown
): value is AuthenticatedPatronV8 {
  if (typeof value !== "object" || value === null) return false
  const status = (value as { authenticateStatus?: unknown }).authenticateStatus
  return (FBS_AUTH_STATUSES as string[]).includes(status as string)
}

export function createFbsClient(config: FbsConfig) {
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
      if (!response.ok) {
        throw new Error(
          `FBS getPatronInfo failed: ${response.status} ${response.statusText}`
        )
      }
      const raw: unknown = await response.json()
      if (!isAuthenticatedPatronV8(raw)) {
        throw new Error("FBS getPatronInfo returned an unexpected response shape")
      }
      return mapAuthenticatedPatron(raw)
    },
  }
}
