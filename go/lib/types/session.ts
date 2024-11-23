export type TSessionType = "adgangsplatformen" | "unilogin" | "anonymous"

export type TApiType = "dpl-cms"

export type TTokenSet = {
  id_token: string
  refresh_expires_in: number
  access_token: string
  refresh_token: string
  expires_in: number
}
