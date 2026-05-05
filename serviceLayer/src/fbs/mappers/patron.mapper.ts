import type { AuthenticatedPatronV8 } from "../generated/model/authenticatedPatronV8"
import type { PatronV7 } from "../generated/model/patronV7"
import type { AuthenticatedPatronInfo, PatronInfo } from "../types"

/**
 * Maps a PatronV7 (from AuthenticatedPatronV8) to our service layer PatronInfo.
 */
export function mapPatronV7(raw: PatronV7): PatronInfo {
  return {
    address: raw.address,
    blockStatus: raw.blockStatus,
    emailAddress: raw.emailAddress,
    guardianVisibility: raw.guardianVisibility,
    name: raw.name,
    notificationProtocols: raw.notificationProtocols,
    onHold: raw.onHold,
    patronId: raw.patronId,
    phoneNumber: raw.phoneNumber,
    preferredLanguage: raw.preferredLanguage,
    preferredPickupBranch: raw.preferredPickupBranch,
    receiveEmail: raw.receiveEmail,
    receivePostalMail: raw.receivePostalMail,
    receiveSms: raw.receiveSms,
    resident: raw.resident,
  }
}

/**
 * Maps the top-level AuthenticatedPatronV8 response to our AuthenticatedPatronInfo.
 */
export function mapAuthenticatedPatron(
  raw: AuthenticatedPatronV8
): AuthenticatedPatronInfo {
  return {
    status: raw.authenticateStatus,
    patron: raw.patron ? mapPatronV7(raw.patron) : undefined,
  }
}
