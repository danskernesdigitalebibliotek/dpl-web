import { getLibraryMunicipalityId } from "@/lib/helpers/unilogin"

import { getInstitution } from "./requests"
import { TIntrospectionResponse } from "./types"

export const isUniloginUserAuthorizedToLogIn = async (introspect: TIntrospectionResponse) => {
  const institutionIds = introspect.institution_ids.replace(/\[([^\]]*)\]/g, "$1").split(",")
  const institutionId = institutionIds[0]
  const institution = await getInstitution(institutionId)
  const municipalityId = getLibraryMunicipalityId()
  return institution.kommunenr === municipalityId
}
