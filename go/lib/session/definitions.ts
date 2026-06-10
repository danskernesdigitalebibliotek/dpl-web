/**
 * Types and constants for session data.
 */

export const SESSION_ID_COOKIE_NAME = "go-session:id"
export const SESSION_TYPE_COOKIE_NAME = "go-session:type"
export const SESSION_DEFAULT_LIFETIME_SECONDS = 7 * 24 * 60 * 60 // 7 days

export type SessionId = string

export type AuthenticationMethod = "adgangsplatformen" | "unilogin" | "anonymous"

export type TUniloginTokenSet = {
  id_token: string
  refresh_expires_in: number
  access_token: string
  refresh_token: string
  expires_in: number
}
export interface TSessionData {
  authenticationMethod: AuthenticationMethod
  isLoggedIn: boolean
  expires?: Date

  // Unilogin specific
  // @todo group these in a uniLogin object.
  access_token?: string
  refresh_token?: string
  id_token?: string
  refresh_expires?: Date
  code_verifier?: string
  uniLoginUserInfo?: {
    sub: string
    uniid: string
    institutionIds: string[]
  }

  user?: {
    name?: string
    username?: string
  }

  adgangsplatformenUserToken?: string
  adgangsplatformenLibraryToken?: string
}
