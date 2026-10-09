import { Factory } from "fishery"

// The shape of a real Adgangsplatformen userinfo response for a Unilogin
// login. The institution ids come as one string, "[ABC111,CDA222]", or "".
type TUniloginUserinfo = {
  attributes: {
    cpr: null
    userId: string
    idpUsed: string
    agencies: string[]
    municipality: string | null
    uniloginUniId: string
    uniloginUserType: string
    uniloginUniIdHash: string
    uniloginHasLicense: boolean
    municipalityAgencyId: string | null
    uniloginInstitutionIds: string
    uniloginMunicipality: string | null
    uniloginAgencyId: string | null
    loggedInAgencyId: string
  }
}

export default Factory.define<TUniloginUserinfo>(() => ({
  attributes: {
    cpr: null,
    userId: "user-id",
    idpUsed: "unilogin_oidc",
    agencies: [],
    municipality: null,
    uniloginUniId: "100006cbab",
    uniloginUserType: "Elev",
    uniloginUniIdHash: "uni-id-hash",
    uniloginHasLicense: true,
    municipalityAgencyId: null,
    uniloginInstitutionIds: "[R00263]",
    uniloginMunicipality: null,
    uniloginAgencyId: null,
    loggedInAgencyId: "190101",
  },
}))
