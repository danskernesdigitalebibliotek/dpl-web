// Pure type / value definitions for the session payload.
//
// Kept in a module that does NOT import the Redis client so that
// client-reachable code (e.g. `lib/helpers/user.ts` consumed by
// `ProfileButton.tsx`) can use these types without dragging ioredis
// into the browser bundle.
import { TSessionType } from "../types/session"

export interface TSessionData {
  isLoggedIn: boolean
  access_token?: string
  refresh_token?: string
  id_token?: string
  expires?: Date
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
  type: TSessionType
}

export type TSession = TSessionData & {
  save: () => Promise<void>
  destroy: () => Promise<void>
}

export const defaultSession: TSessionData = {
  isLoggedIn: false,
  access_token: undefined,
  refresh_token: undefined,
  id_token: undefined,
  expires: undefined,
  refresh_expires: undefined,
  code_verifier: undefined,
  uniLoginUserInfo: undefined,
  user: undefined,
  adgangsplatformenUserToken: undefined,
  adgangsplatformenLibraryToken: undefined,
  type: "anonymous",
}
