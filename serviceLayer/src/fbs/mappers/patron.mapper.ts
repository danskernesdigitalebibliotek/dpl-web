import type { AuthenticatedPatronV8 } from "../generated/model/authenticatedPatronV8"
import type { PatronV5 } from "../generated/model/patronV5"
import type { PatronV7 } from "../generated/model/patronV7"
import type { AuthenticatedPatronInfo, PatronInfo } from "../types"

/**
 * Maps a PatronV7 (from AuthenticatedPatronV8) to our service layer PatronInfo.
 * PatronV7 has all the fields of PatronV5 plus: tags, interests, guardianVisibility.
 */
export function mapPatronV7(raw: PatronV7): PatronInfo {
  return {
    address: raw.address,
    allowBookings: raw.allowBookings,
    birthday: raw.birthday,
    blockStatus: raw.blockStatus,
    defaultInterestPeriod: raw.defaultInterestPeriod,
    emailAddress: raw.emailAddress,
    guardianVisibility: raw.guardianVisibility,
    interests: raw.interests?.map((interest) => ({ ...interest })),
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
    secondaryAddress: raw.secondaryAddress,
    tags: raw.tags,
  }
}

/**
 * Maps a PatronV5 (used in the React app) to our service layer PatronInfo.
 * PatronV5 lacks tags, interests, and guardianVisibility compared to V7.
 */
export function mapPatronV5(raw: PatronV5): PatronInfo {
  return {
    address: raw.address,
    allowBookings: raw.allowBookings,
    birthday: raw.birthday,
    blockStatus: raw.blockStatus,
    defaultInterestPeriod: raw.defaultInterestPeriod,
    emailAddress: raw.emailAddress,
    guardianVisibility: false,
    interests: undefined,
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
    secondaryAddress: raw.secondaryAddress,
    tags: undefined,
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
