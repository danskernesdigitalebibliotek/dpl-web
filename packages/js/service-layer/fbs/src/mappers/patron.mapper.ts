import type {
  AuthenticatedPatronInfo,
  AuthenticationStatus,
} from "../../../src/types"
import type { AuthenticatedPatronV8 } from "../generated/model/authenticatedPatronV8"
import type { AuthenticatedPatronV8AuthenticateStatus } from "../generated/model/authenticatedPatronV8AuthenticateStatus"

const FBS_STATUS_TO_DOMAIN: Record<
  AuthenticatedPatronV8AuthenticateStatus,
  AuthenticationStatus
> = {
  VALID: "VALID",
  INVALID: "INVALID",
  LOANER_LOCKED_OUT: "LOCKED_OUT",
}

export function mapAuthenticatedPatron(
  raw: AuthenticatedPatronV8
): AuthenticatedPatronInfo {
  return {
    status: FBS_STATUS_TO_DOMAIN[raw.authenticateStatus],
    patron: raw.patron
      ? {
          name: raw.patron.name,
          patronId: raw.patron.patronId,
        }
      : undefined,
  }
}
