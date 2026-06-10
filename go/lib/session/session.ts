import { add, isPast, sub } from "date-fns"
import { unstable_rethrow } from "next/navigation"
import { NextResponse, connection } from "next/server"

import { CLIENT_COOKIE_OPTIONS, DEFAULT_COOKIE_OPTIONS } from "@/lib/config/cookies"
import { getBaseURL } from "@/lib/config/getBaseURL"

import goConfig from "../config/goConfig"
import { isBuildingGoApp } from "../helpers/next-phase"
import { loadPatronServerSide } from "../helpers/service-layer"
import { userIsAnonymous } from "../helpers/user"
import { TSessionType, TUniloginTokenSet } from "../types/session"
import redis from "./redis"

const SESSION_COOKIE_NAME = "go-session"
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7 // 1 week
const REDIS_KEY_PREFIX = "go:session:"

const sessionKey = (id: string) => `${REDIS_KEY_PREFIX}${id}`

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

const reviveSessionJson = (key: string, value: unknown) => {
  if ((key === "expires" || key === "refresh_expires") && typeof value === "string") {
    const d = new Date(value)
    if (!Number.isNaN(d.getTime())) return d
  }
  return value
}

const stripMethods = (session: TSession): TSessionData => {
  // Avoid serializing the attached methods.
  const { save: _save, destroy: _destroy, ...rest } = session
  void _save
  void _destroy
  return rest as TSessionData
}

type SessionIdRef = { id: string | undefined }

const attachMethods = (data: TSessionData, idRef: SessionIdRef): TSession => {
  const session = { ...data } as TSession
  session.save = async () => {
    if (!idRef.id) {
      idRef.id = crypto.randomUUID()
    }
    const payload = JSON.stringify(stripMethods(session))
    await redis.set(sessionKey(idRef.id), payload, "EX", SESSION_TTL_SECONDS)
    const { cookies } = await import("next/headers")
    const cookieStore = await cookies()
    cookieStore.set(SESSION_COOKIE_NAME, idRef.id, {
      ...DEFAULT_COOKIE_OPTIONS,
      maxAge: SESSION_TTL_SECONDS,
    })
  }
  session.destroy = async () => {
    if (idRef.id) {
      try {
        await redis.del(sessionKey(idRef.id))
      } catch (error) {
        // Logout should always succeed from the user's perspective; the key
        // will expire naturally within the TTL.
        console.error("session destroy: redis del failed", error)
      }
      idRef.id = undefined
    }
    Object.assign(session, defaultSession)
    await deleteGoSessionCookies()
  }
  return session
}

export async function getSession(): Promise<TSession> {
  // If we are building the go app, we will use the default session to simulate an anonymous user.
  if (isBuildingGoApp()) {
    return attachMethods(defaultSession, { id: undefined })
  }

  try {
    const { cookies } = await import("next/headers")
    const cookieStore = await cookies()
    const libraryToken = cookieStore.get(goConfig("library-token.cookie-name"))?.value
    const cookieValue = cookieStore.get(SESSION_COOKIE_NAME)?.value
    const idRef: SessionIdRef = { id: cookieValue }

    let stored: TSessionData | null = null
    if (cookieValue) {
      const raw = await redis.get(sessionKey(cookieValue))
      if (raw) {
        stored = JSON.parse(raw, reviveSessionJson) as TSessionData
      }
    }

    const data: TSessionData = stored ?? { ...defaultSession }

    if (!data.isLoggedIn) {
      // Return the default session if the session is not logged in.
      // But if the session has a code_verifier, we will keep that.
      // The code_verifier is used for verifying the PKCE challenge
      // when coming back from Unilogin.
      const preserved: TSessionData = {
        ...defaultSession,
        ...(data.code_verifier ? { code_verifier: data.code_verifier } : {}),
        ...(libraryToken ? { adgangsplatformenLibraryToken: libraryToken } : {}),
      }
      return attachMethods(preserved, idRef)
    }

    if (libraryToken) {
      data.adgangsplatformenLibraryToken = libraryToken
    }

    return attachMethods(data, idRef)
  } catch (error) {
    // Try to follow unstable_rethrow advise in this post:
    // https://stackoverflow.com/questions/78010331/dynamic-server-usage-page-couldnt-be-rendered-statically-because-it-used-next
    unstable_rethrow(error)

    console.error("getSession error", error)
    return attachMethods(defaultSession, { id: undefined })
  }
}

export const setUniloginTokensOnSession = async (
  session: TSession,
  tokenSet: TUniloginTokenSet
) => {
  const { cookies } = await import("next/headers")

  session.access_token = tokenSet.access_token
  session.refresh_token = tokenSet.refresh_token
  session.expires = add(new Date(), {
    seconds: tokenSet.expires_in || 0,
  })
  session.refresh_expires = add(new Date(), {
    seconds: Number(tokenSet?.refresh_expires_in),
  })
  // Since we have a limitation in how big cookies can be,
  // we will have to store the user id in a separate cookie.
  const cookieStore = await cookies()
  cookieStore.set(goConfig("auth.cookie-name.id-token"), tokenSet.id_token)
  cookieStore.set(goConfig("auth.cookie-names.session-type"), "unilogin")
}

type TAdgangsplatformenUserToken = {
  token: string
  expire: {
    timestamp: number
  }
}

export const setAdgangsplatformenUserTokenOnSession = async (
  session: TSession,
  token: TAdgangsplatformenUserToken
) => {
  const { cookies } = await import("next/headers")

  session.adgangsplatformenUserToken = token.token
  session.expires = new Date(token.expire.timestamp * 1000)
  const cookieStore = await cookies()
  cookieStore.set(
    goConfig("auth.cookie-names.session-type"),
    "adgangsplatformen",
    CLIENT_COOKIE_OPTIONS
  )
}

export const saveAdgangsplatformenSession = async (
  session: TSession,
  userToken: TAdgangsplatformenUserToken
) => {
  session.isLoggedIn = true
  session.type = "adgangsplatformen"
  await setAdgangsplatformenUserTokenOnSession(session, userToken)
  // Get name of user/patron from FBS. FBS may be unavailable or refuse the
  // call (test mocks, locked-out patrons, etc.); we don't want that to break
  // the login. Log and continue without setting session.user — matches the
  // pre-service-layer fetcher's "log and return null" behaviour.
  let patron
  try {
    patron = await loadPatronServerSide(userToken.token)
  } catch (error) {
    console.error("Could not load patron during Adgangsplatformen login:", error)
  }
  if (patron?.name) {
    session.user = {
      name: patron.name,
      // Adgangsplatformen does not return a username.
      username: undefined,
    }
  }

  await session.save()
}

export const uniloginAccessTokenHasExpired = (session: TSession) => {
  if (userIsAnonymous(session) || session.type !== "unilogin") {
    return false
  }

  // When the session was created we saved when the Unilogin system consider the refresh token to be expired.
  // If we are past that time, we consider the access token to be expired.
  if (session.refresh_expires && isPast(session.refresh_expires)) {
    return true
  }

  return false
}

export const uniloginAccessTokenShouldBeRefreshed = (session: TSession) => {
  // If the session is not logged in, or it is not a unilogin session
  // we don't need to refresh the access token.
  if (userIsAnonymous(session) || session.type !== "unilogin" || !session.refresh_token) {
    return false
  }

  const bufferedExp = { expires: new Date(), refresh_expires: new Date() }

  // Create a buffer of 1 minute on expire times to make sure we don't run into any timing issues.
  if (session.expires) {
    bufferedExp.expires = sub(session.expires, { minutes: 1 })
  }

  if (session.refresh_expires) {
    bufferedExp.refresh_expires = sub(session.refresh_expires, { minutes: 1 })
  }

  if (session.refresh_expires && isPast(bufferedExp.refresh_expires)) {
    return true
  }

  if (session.expires && isPast(bufferedExp.expires)) {
    return true
  }

  return false
}

export const adgangsplatformenAccessTokenHasExpired = (session: TSession) => {
  if (userIsAnonymous(session) || session.type !== "adgangsplatformen") {
    return false
  }
  // When the session was created we saved when we consider the access token to be expired.
  // If we are past that time, we consider the access token to be expired.
  if (session.expires && isPast(session.expires)) {
    return true
  }

  return false
}

export const adgangsplatformenAccessTokenShouldBeRefreshed = (session: TSession) => {
  // If the session is not logged in, or it is not a adgangsplatformen session
  // we don't need to refresh the access token.
  if (userIsAnonymous(session) || session.type !== "adgangsplatformen") {
    return false
  }

  const bufferedExp = { expires: new Date() }

  // Create a buffer of 1 minute on expire times to make sure we don't run into any timing issues.
  if (session.expires) {
    bufferedExp.expires = sub(session.expires, { minutes: 1 })
  }

  if (session.expires && isPast(bufferedExp.expires)) {
    return true
  }

  return false
}

export const getUniloginIdToken = async () => {
  const { cookies } = await import("next/headers")
  return (await cookies()).get(goConfig("auth.cookie-name.id-token"))?.value
}

export const getSessionTypeToken = async () => {
  const { cookies } = await import("next/headers")
  return (await cookies()).get(goConfig("auth.cookie-name.id-token"))?.value
}

const deleteGoSessionCookies = async () => {
  const { cookies } = await import("next/headers")
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
  // Sweep any leftover iron-session multipart cookies from before the
  // Redis migration. iron-session has used both `:` and `_` separators
  // across versions, so cover both.
  for (const cookie of cookieStore.getAll()) {
    if (
      cookie.name.startsWith(`${SESSION_COOKIE_NAME}:`) ||
      cookie.name.startsWith(`${SESSION_COOKIE_NAME}_`)
    ) {
      cookieStore.delete(cookie.name)
    }
  }
}

export const getDplCmsSessionCookie = async () => {
  const { cookies } = await import("next/headers")
  const cookieStore = await cookies()
  const allCookies = cookieStore.getAll()

  const sessionCookie = allCookies.find(cookie => cookie.name.startsWith("SSESS"))
  return sessionCookie ?? null
}

export const destroySession = async (session: TSession) => {
  // ⁠await connection() is used to ensure that this function dynamically renders correctly.
  // https://nextjs.org/docs/app/api-reference/functions/connection
  await connection()
  await session.destroy()
}

export const destroySessionAndRedirectToFrontPage = async (session: TSession) => {
  await destroySession(session)
  return redirectToFrontPageAndReloadSession()
}

export const redirectToFrontPageAndReloadSession = async () => {
  return NextResponse.redirect(`${getBaseURL()}?reload-session=true`)
}

export const sessionHasPKCECodeVerifier = (session: TSession) => {
  return !!session.code_verifier
}

export const removePCKECodeVerifierFromSession = async (session: TSession) => {
  delete session.code_verifier
  await session.save()
}
