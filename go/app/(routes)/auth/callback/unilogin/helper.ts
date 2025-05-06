import { getInstitutionRequest } from "@/app/(routes)/auth/callback/unilogin/requests"
import { getLibraryMunicipalityId } from "@/lib/helpers/unilogin"

export const isUniloginUserAuthorizedToLogIn = async (
  institutionId: string | null,
  claims: { has_license: string }
) => {
  // If the user do not have a license through STIL we do not allow access
  if (claims?.has_license === "false") {
    console.error("User does not have a STIL license")
    return false
  }

  if (!institutionId) {
    console.error("InstitutionId was not provided")
    return false
  }
  const institution = await getInstitutionRequest(institutionId)
  const municipalityId = getLibraryMunicipalityId()
  // If the institution is DDF we are using a test user and therefore allow access
  if (institution.instnr === "A04441") {
    return true
  }
  return institution.kommunenr === municipalityId
}
