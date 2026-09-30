import { getServerEnv } from "@/lib/config/env"
import { zodParseWithContext } from "@/lib/helpers/zod-validation"

import { TUniloginUserinfoAttributes } from "./schemas"

// R00263 is the DDF test institution. Users belonging to it are test users
// and bypass the municipality check.
export const TEST_INSTITUTION_IDS = ["R00263"]

export const isUniloginUserAuthorizedToLogIn = (attributes: TUniloginUserinfoAttributes) => {
  // If the user does not have a license through STIL we do not allow access.
  if (!attributes.uniloginHasLicense) {
    console.error("unilogin error: User does not have a STIL license")
    return false
  }

  // If the user belongs to the DDF test institution we allow access.
  if (attributes.uniloginInstitutionIds.some(id => TEST_INSTITUTION_IDS.includes(id))) {
    return true
  }

  const agencyId = getServerEnv("UNILOGIN_AGENCY_ID")
  if (!agencyId) {
    console.error("unilogin error: UNILOGIN_AGENCY_ID is not configured")
    return false
  }

  // The adapter derives municipalityAgencyId from the user's institution,
  // so this is the same municipality gate as before - just based on
  // agency ids instead of municipality numbers.
  const municipalityMatch = attributes.municipalityAgencyId === agencyId
  if (!municipalityMatch) {
    console.error(
      `unilogin error: User municipality ${attributes.municipalityAgencyId} does not match expected agency ${agencyId}`
    )
  }
  return municipalityMatch
}

export const parseUniloginServiceResponse = <T>({
  parsingFunction,
  uniid,
  step,
}: {
  parsingFunction: () => T
  step: "tokenSet" | "userinfo"
  uniid?: string
}) =>
  zodParseWithContext(
    parsingFunction,
    uniid
      ? `[${step}] error affecting user with the uniid: ${uniid}`
      : `[${step}] error parsing Unilogin service response`
  )
