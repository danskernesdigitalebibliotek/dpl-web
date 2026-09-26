export type TSessionType = "adgangsplatformen" | "unilogin" | "anonymous"

export type TUniloginTokenSet = {
  id_token: string
  refresh_expires_in: number
  access_token: string
  refresh_token: string
  expires_in: number
}
