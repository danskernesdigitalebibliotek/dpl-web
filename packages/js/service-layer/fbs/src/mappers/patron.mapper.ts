import type { AuthenticatedPatronV8 } from "../generated/model/authenticatedPatronV8"
import type { AuthenticatedPatronInfo } from "../types"

export function mapAuthenticatedPatron(
  raw: AuthenticatedPatronV8
): AuthenticatedPatronInfo {
  return {
    status: raw.authenticateStatus,
    patron: raw.patron
      ? {
          name: raw.patron.name,
          patronId: raw.patron.patronId,
        }
      : undefined,
  }
}
