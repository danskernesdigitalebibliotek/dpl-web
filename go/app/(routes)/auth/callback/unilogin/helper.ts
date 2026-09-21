import { getInstitutionRequest } from "@/app/(routes)/auth/callback/unilogin/requests"
import { getLibraryMunicipalityId } from "@/lib/helpers/unilogin"
import { zodParseWithContext } from "@/lib/helpers/zod-validation"

export const isUniloginUserAuthorizedToLogIn = async (
  institutionId: string | null,
  claims: { has_license: string }
) => {
  // If the user do not have a license through STIL we do not allow access
  if (claims?.has_license === "false") {
    console.error("unilogin error: User does not have a STIL license")
    return false
  }

  if (!institutionId) {
    console.error("unilogin error: InstitutionId was not provided")
    return false
  }
  const institution = await getInstitutionRequest(institutionId)
  const municipalityId = await getLibraryMunicipalityId()
  // If the institution is DDF we are using a test user and therefore allow access.
  // A04441 is the legacy DDF provider number, R00263 the new DDF test institution.
  // TODO: Remove A04441 after the STIL cutoff date 2026-09-22.
  if (["A04441", "R00263"].includes(institution.instnr)) {
    return true
  }

  const municipalityMatch = institution.kommunenr === municipalityId
  if (!municipalityMatch) {
    console.error(
      `unilogin error: User institution does not match expected municipality ${municipalityId}`,
      institution
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
  step: "introspect" | "userinfo"
  uniid?: string
}) =>
  zodParseWithContext(
    parsingFunction,
    uniid
      ? `[${step}] error affecting user with the uniid: ${uniid}`
      : `[${step}] error parsing Unilogin service response`
  )
