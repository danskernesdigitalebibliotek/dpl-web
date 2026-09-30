import { Factory } from "fishery"
import { z } from "zod"

import schemas from "@/app/(routes)/auth/callback/unilogin/schemas"

import { institutionIds, municipalityAgencyId, uniid } from "./tokenSet"

type Schema = z.input<typeof schemas.userinfo>

export default Factory.define<Schema>(() => ({
  attributes: {
    uniloginUniId: uniid,
    uniloginHasLicense: true,
    uniloginInstitutionIds: institutionIds,
    municipalityAgencyId,
    uniloginAgencyId: municipalityAgencyId,
    uniloginUserType: "Elev",
    uniloginUniIdHash: "0".repeat(64),
  },
}))
