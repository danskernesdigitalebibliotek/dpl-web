export type TSessionType = "adgangsplatformen" | "unilogin" | "anonymous"

export type TApiType = "dpl-cms"

// Token response from the Adgangsplatformen adapter (login.bib.dk).
// Refresh tokens are only issued if the client is configured for it,
// and the adapter does not issue id tokens.
export type TUniloginTokenSet = {
  access_token: string
  expires_in: number
  refresh_token?: string
  refresh_expires_in?: number
  id_token?: string
}
