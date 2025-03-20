import { getInstitutionRequest } from "@/app/auth/callback/unilogin/requests"
import { getLibraryMunicipalityId } from "@/lib/helpers/unilogin"

export const isUniloginUserAuthorizedToLogIn = async (institutionId: string | null) => {
  if (!institutionId) {
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
