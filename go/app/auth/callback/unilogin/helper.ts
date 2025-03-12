import { getLibraryMunicipalityId } from "@/lib/helpers/unilogin"

import { getInstitution } from "./requests"
import { TIntrospectionResponse } from "./types"

export const isUniloginUserAuthorizedToLogIn = async (introspect: TIntrospectionResponse) => {
  const institutionIds = introspect.institution_ids.replace(/\[([^\]]*)\]/g, "$1").split(",")
  const institutionId = institutionIds[0]
  const institution = await getInstitution(institutionId)
  const municipalityId = getLibraryMunicipalityId()
  // If the institution is DDF we are using a test user and therefore allow access
  if (institution.instnr === "A04441") {
    return true
  }
  return institution.kommunenr === municipalityId
}
