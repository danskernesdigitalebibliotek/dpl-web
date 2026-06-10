import { add, isPast, sub } from "date-fns"
import { IronSession, SessionOptions } from "iron-session"
import { cookies } from "next/headers"
import { NextResponse, connection } from "next/server"
// eslint-disable-next-line import-x/no-unresolved
import "server-only"

import { CLIENT_COOKIE_OPTIONS, DEFAULT_COOKIE_OPTIONS } from "@/lib/config/cookies"
import { getServerEnv } from "@/lib/config/env"
import { getBaseURL } from "@/lib/config/getBaseURL"
import { RedisSessionDataProvider } from "@/lib/session/RedisSessionDataProvider"
import {
  SESSION_DEFAULT_LIFETIME_SECONDS,
  SESSION_ID_COOKIE_NAME,
  SESSION_TYPE_COOKIE_NAME,
  SessionId,
  TSessionData,
  TUniloginTokenSet,
} from "@/lib/session/definitions"

import goConfig from "../config/goConfig"
import { isBuildingGoApp } from "../helpers/next-phase"
import { loadPatronServerSide } from "../helpers/service-layer"
import { userIsAnonymous } from "../helpers/user"

export async function getSessionDataProvider() {
  const sessionId = await getSessionIdAndCreateIfMissing()

  return new RedisSessionDataProvider(sessionId)
}

export const getSessionOptions = (): SessionOptions => {
  const sessionSecret = getServerEnv("GO_SESSION_SECRET")

  return {
    password: sessionSecret,
    cookieName: "go-session",
    cookieOptions: {
      ...DEFAULT_COOKIE_OPTIONS,
    },
    // TODO: Decide on the session ttl.
    ttl: 60 * 60 * 24 * 7, // 1 week
  }
}

export const defaultSession: TSessionData = {
  authenticationMethod: "anonymous",
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
}

const obsoleteCookieNames = ["go-tokens:library-token", "go-session:id_token"]

/**
 * For migration to Redis session cookies, delete the old obsolete cookies.
 *
 * This can be removed once the migration is complete.
 */
export async function deleteObsoleteCookies() {
  const cookieStore = await cookies()
  for (const cookieName of obsoleteCookieNames) {
    cookieStore.delete(cookieName)
  }
}

export async function getSession(): Promise<IronSession<TSessionData>> {
  // If we are building the go app, we will use the default session to simulate an anonymous user.
  if (isBuildingGoApp()) {
    return defaultSession as IronSession<TSessionData>
  }

  // const sessionOptions = getSessionOptions()
  //
  // try {
  //   const { cookies } = await import("next/headers")
  //   const cookieStore = await cookies()
  //
  //   deleteObsoleteCookies(cookieStore)
  //   const sessionId: SessionId = getSessionIdAndCreateIfMissing(cookieStore)
  //
  //   const isLoggedIn = getSessionValue(sessionId, "isLoggedIn")
  //
  //   // const libraryToken = cookieStore.get(goConfig("library-token.cookie-name"))?.value
  //   const session = await getIronSession<TSessionData>(cookieStore, sessionOptions)
  //
  //   if (!isLoggedIn) {
  //     // Return the default session if the session is not logged in.
  //     // But if the session has a code_verifier, we will keep that.
  //     // The code_verifier is used for verifying the PKCE challenge
  //     // when coming back from Unilogin.
  //     return Object.assign(session, defaultSession, {
  //       ...(session.code_verifier ? { code_verifier: session.code_verifier } : {}),
  //       ...(libraryToken ? { adgangsplatformenLibraryToken: libraryToken } : {}),
  //     }) as IronSession<TSessionData>
  //   }
  //
  //   if (libraryToken) {
  //     session.adgangsplatformenLibraryToken = libraryToken
  //   }
  //
  //   return session
  // } catch (error) {
  //   // Try to follow unstable_rethrow advise in this post:
  //   // https://stackoverflow.com/questions/78010331/dynamic-server-usage-page-couldnt-be-rendered-statically-because-it-used-next
  //   unstable_rethrow(error)
  //
  //   console.error("getSession error", error)
  return defaultSession as IronSession<TSessionData>
  // }
}

/**
 * Get session ID from the cookie store, if set.
 */
export async function getSessionId(): Promise<SessionId | undefined> {
  const cookieStore = await cookies()
  return cookieStore.get(SESSION_ID_COOKIE_NAME)?.value
}

/**
 * Get session ID from the cookie store.
 *
 * If one is not set, a new random ID is created and saved in a cookie.
 */
export async function getSessionIdAndCreateIfMissing(): Promise<SessionId> {
  const sessionId = getSessionId()
  if (!sessionId) {
    const newSessionId = crypto.randomUUID()
    await setSessionId(newSessionId)

    return newSessionId
  }

  return sessionId
}

/**
 * Save session ID as a cookie.
 */
async function setSessionId(sessionId: SessionId): Promise<void> {
  // Record the new session in Redis, and set its expiry.
  const sessionData = new RedisSessionDataProvider(sessionId)
  await sessionData.setIsAuthenticated(false)
  void sessionData.setTtl(SESSION_DEFAULT_LIFETIME_SECONDS)

  const cookieStore = await cookies()
  cookieStore.set(SESSION_ID_COOKIE_NAME, sessionId, DEFAULT_COOKIE_OPTIONS)
}

export const setUniloginTokensOnSession = async (
  sessionData: RedisSessionDataProvider,
  tokenSet: TUniloginTokenSet
) => {
  const { cookies } = await import("next/headers")

  sessionData.setValue("access_token", tokenSet.access_token)
  sessionData.setValue("refresh_token", tokenSet.refresh_token)

  if (tokenSet.expires_in) {
    sessionData.setTtl(tokenSet.expires_in)

    sessionData.setValue(
      "refresh_expires",
      add(new Date(), {
        seconds: Number(tokenSet?.refresh_expires_in),
      })
    )
  }

  sessionData.setValue("id_token", tokenSet.id_token)

  // Since we have a limitation in how big cookies can be,
  // we will have to store the user id in a separate cookie.
  const cookieStore = await cookies()
  cookieStore.set(SESSION_TYPE_COOKIE_NAME, "unilogin", CLIENT_COOKIE_OPTIONS)
}

type TAdgangsplatformenUserToken = {
  token: string
  expire: {
    timestamp: number
  }
}

export const setAdgangsplatformenUserTokenOnSession = async (
  sessionData: RedisSessionDataProvider,
  token: TAdgangsplatformenUserToken
) => {
  sessionData.setValue("adgangsplatformenUserToken", token.token)
  sessionData.setExpiresAt(token.expire.timestamp)
  const cookieStore = await cookies()
  cookieStore.set(SESSION_TYPE_COOKIE_NAME, "adgangsplatformen", CLIENT_COOKIE_OPTIONS)
}

export const saveAdgangsplatformenSession = async (
  sessionData: RedisSessionDataProvider,
  userToken: TAdgangsplatformenUserToken
) => {
  await sessionData.setIsAuthenticated(true)
  await sessionData.setValue("authenticationMethod", "adgangsplatformen")
  await setAdgangsplatformenUserTokenOnSession(sessionData, userToken)

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
    sessionData.setValue("user", {
      name: patron.name,
      // Adgangsplatformen does not return a username.
      username: undefined,
    })
  }
}

export const uniloginAccessTokenHasExpired = (session: IronSession<TSessionData>) => {
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

export const uniloginAccessTokenShouldBeRefreshed = (session: IronSession<TSessionData>) => {
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

export const adgangsplatformenAccessTokenHasExpired = (session: IronSession<TSessionData>) => {
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

export const adgangsplatformenAccessTokenShouldBeRefreshed = (
  session: IronSession<TSessionData>
) => {
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
  const allCookies = cookieStore.getAll()

  allCookies.map(async cookie => {
    if (cookie.name.startsWith("go-session:")) {
      ;(await cookies()).delete(cookie.name)
    }
  })
}

export const getDplCmsSessionCookie = async () => {
  const { cookies } = await import("next/headers")
  const cookieStore = await cookies()
  const allCookies = cookieStore.getAll()

  const sessionCookie = allCookies.find(cookie => cookie.name.startsWith("SSESS"))
  return sessionCookie ?? null
}

export const destroySession = async (session: IronSession<TSessionData>) => {
  // ⁠await connection() is used to ensure that this function dynamically renders correctly, as ⁠session.destroy() only operates on the client.
  // https://nextjs.org/docs/app/api-reference/functions/connection
  await connection()
  // Destroy session and additional go-session cookies.
  session.destroy()
  await deleteGoSessionCookies()
}

export const destroySessionAndRedirectToFrontPage = async (session: IronSession<TSessionData>) => {
  await destroySession(session)
  return redirectToFrontPageAndReloadSession()
}

export const redirectToFrontPageAndReloadSession = async () => {
  return NextResponse.redirect(`${getBaseURL()}?reload-session=true`)
}

export const sessionHasPKCECodeVerifier = (session: IronSession<TSessionData>) => {
  return !!session.code_verifier
}

export const removePCKECodeVerifierFromSession = async (session: IronSession<TSessionData>) => {
  delete session.code_verifier
  await session.save()
}
