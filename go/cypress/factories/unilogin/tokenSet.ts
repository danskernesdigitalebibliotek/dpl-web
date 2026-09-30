import { Factory } from "fishery"

export const uniid = "Mocked User"
export const institutionIds = ["R00263"]
export const municipalityAgencyId = "710100"

// Token response from the Adgangsplatformen adapter (login.bib.dk).
type TAdapterTokenResponse = {
  access_token: string
  token_type: string
  expires_in: number
}

export default Factory.define<TAdapterTokenResponse>(() => ({
  access_token: "mocked-adapter-access-token",
  token_type: "Bearer",
  expires_in: 3600,
}))
