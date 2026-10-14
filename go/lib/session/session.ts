import { getPatron } from "@danskernesdigitalebibliotek/dpl-service-layer"
import { add, isPast } from "date-fns"
import { IronSession, SessionOptions, getIronSession } from "iron-session"
import { unstable_rethrow } from "next/navigation"
import { NextResponse, connection } from "next/server"

import { CLIENT_COOKIE_OPTIONS, DEFAULT_COOKIE_OPTIONS } from "@/lib/config/cookies"
import { getServerEnv } from "@/lib/config/env"
import { getBaseURL } from "@/lib/config/getBaseURL"

import goConfig from "../config/goConfig"
import type { TServiceType } from "../helpers/ap-service"
import { isBuildingGoApp } from "../helpers/next-phase"
import { getServiceLayerConfig } from "../helpers/service-layer"
import { loadUniloginUserInfo } from "../helpers/unilogin"
import { userIsAnonymous } from "../helpers/user"
import { TSessionType, TUserToken } from "../types/session"

/**
 * Get the iron-session options for the encrypted go-session cookie.
 *
 * @returns The session options, sealed with the GO_SESSION_SECRET.
 */
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
    chunking: {
      enabled: true,
    },
  }
}

export interface TSessionData {
  isLoggedIn: boolean
  expires?: Date
  uniLoginUserInfo?: {
    uniid: string
    institutionIds: string[]
  }
  user?: {
    name?: string
    username?: string
  }
  // The user token from the CMS, whatever the session type. A patron's token
  // may go to the patron services (getPatronUserToken()); a Unilogin user's
  // token only to the Biblio adapter for digital loans
  // (getDigitalLoanUserToken()). See getServiceUserToken().
  userToken?: string
  adgangsplatformenLibraryToken?: string
  // When the CMS last confirmed that this session is still a live one.
  validatedAt?: Date
  type: TSessionType
}

export const defaultSession: TSessionData = {
  isLoggedIn: false,
  expires: undefined,
  uniLoginUserInfo: undefined,
  user: undefined,
  userToken: undefined,
  adgangsplatformenLibraryToken: undefined,
  validatedAt: undefined,
  type: "anonymous",
}

/**
 * Get the current GO session.
 *
 * A session that is not logged in is reset to the anonymous default session.
 * The library token cookie, if present, is copied onto the session either way.
 *
 * @returns The current session, or the default session while building the app
 *   or if the session cannot be read.
 */
export async function getSession(): Promise<IronSession<TSessionData>> {
  // If we are building the go app, we will use the default session to simulate an anonymous user.
  if (isBuildingGoApp()) {
    return defaultSession as IronSession<TSessionData>
  }

  const sessionOptions = getSessionOptions()

  try {
    const { cookies } = await import("next/headers")
    const cookieStore = await cookies()
    const libraryToken = cookieStore.get(goConfig("library-token.cookie-name"))?.value
    const session = await getIronSession<TSessionData>(cookieStore, sessionOptions)

    if (!session?.isLoggedIn) {
      // Return the default session if the session is not logged in.
      return Object.assign(session, defaultSession, {
        ...(libraryToken ? { adgangsplatformenLibraryToken: libraryToken } : {}),
      }) as IronSession<TSessionData>
    }

    if (libraryToken) {
      session.adgangsplatformenLibraryToken = libraryToken
    }
    migrateLegacySession(session)

    return session
  } catch (error) {
    // Try to follow unstable_rethrow advise in this post:
    // https://stackoverflow.com/questions/78010331/dynamic-server-usage-page-couldnt-be-rendered-statically-because-it-used-next
    unstable_rethrow(error)

    console.error("getSession error", error)
    return defaultSession as IronSession<TSessionData>
  }
}

/**
 * Set the session type cookie, which client code can read.
 *
 * @param type - The session type: "adgangsplatformen" or "unilogin".
 */
const setSessionTypeCookie = async (type: TUserToken["type"]) => {
  const { cookies } = await import("next/headers")
  const cookieStore = await cookies()
  cookieStore.set(goConfig("auth.cookie-names.session-type"), type, CLIENT_COOKIE_OPTIONS)
}

/**
 * Move the user token of a session saved before it was called userToken.
 *
 * Sessions live in the browser for up to a week, so this keeps patrons logged
 * in across the release. It can be removed once those sessions have expired.
 *
 * @param session - The session to migrate.
 */
export const migrateLegacySession = (
  session: TSessionData & { adgangsplatformenUserToken?: string }
) => {
  if (session.adgangsplatformenUserToken && !session.userToken) {
    session.userToken = session.adgangsplatformenUserToken
  }
  delete session.adgangsplatformenUserToken
}

/**
 * Get the user token that may be sent to the services as a user token.
 *
 * Only a patron's token may be sent to FBS, FBI and the other services. A
 * Unilogin student is not a patron, so the student's token stays in the
 * session for later use, e.g. towards Publizon, but is not returned here.
 *
 * @param session - The session to read.
 * @returns The patron's user token, or undefined for any other session.
 */
export const getPatronUserToken = (session: TSessionData) =>
  session.type === "adgangsplatformen" ? session.userToken : undefined

/**
 * Get the user token that authenticates a digital loan.
 *
 * Both a patron and a Unilogin user may borrow digital materials: since
 * Unilogin runs through Adgangsplatformen (ADR-013) a Unilogin user holds a
 * real Adgangsplatformen token too. Unlike getPatronUserToken() this covers
 * Unilogin, but the token must still never reach FBS or FBI — only the Biblio
 * adapter asks for it, through getServiceUserToken().
 *
 * @param session - The session to read.
 * @returns The user token for a patron or Unilogin session, else undefined.
 */
export const getDigitalLoanUserToken = (session: TSessionData) =>
  session.type === "adgangsplatformen" || session.type === "unilogin"
    ? session.userToken
    : undefined

/**
 * Get the user token to send to a service for this session.
 *
 * FBS, FBI and the other patron services only ever accept a real patron's
 * token. The Biblio adapter authenticates digital loans, which a Unilogin user
 * may also make, so it accepts the digital-loan token too. Keeping the choice
 * here keeps the "never to FBS/FBI for Unilogin" rule in one place.
 *
 * @param session - The session to read.
 * @param serviceType - The service the token is for.
 * @returns The user token the service may receive, or undefined.
 */
export const getServiceUserToken = (session: TSessionData, serviceType: TServiceType) =>
  serviceType === "biblio" ? getDigitalLoanUserToken(session) : getPatronUserToken(session)

/**
 * Set what every logged-in session has, whatever its type.
 *
 * The session lives exactly as long as the user token (ADR-012, ADR-013).
 *
 * @param session - The session to log in.
 * @param userToken - The user token from the CMS.
 */
const setSessionDefaults = async (session: IronSession<TSessionData>, userToken: TUserToken) => {
  session.isLoggedIn = true
  session.type = userToken.type
  session.userToken = userToken.token
  session.expires = new Date(userToken.expire.timestamp * 1000)
  await setSessionTypeCookie(userToken.type)
}

/**
 * Save a logged-in session for a library patron.
 *
 * The user token is kept on the session, so it can be used towards FBS and the
 * other services. The patron's name is read from FBS if it is available.
 *
 * @param session - The session to log in.
 * @param userToken - The patron's user token from the CMS.
 * @returns Always true: a patron session is created even if FBS fails.
 */
const saveAdgangsplatformenSession = async (
  session: IronSession<TSessionData>,
  userToken: TUserToken
) => {
  await setSessionDefaults(session, userToken)
  // Get name of user/patron from FBS. FBS may be unavailable or refuse the
  // call (test mocks, locked-out patrons, etc.); we don't want that to break
  // the login. Log and continue without setting session.user — matches the
  // pre-service-layer fetcher's "log and return null" behaviour.
  let patron
  try {
    patron = await getPatron(getServiceLayerConfig(userToken.token))
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
  return true
}

/**
 * Save a logged-in session for a Unilogin student.
 *
 * The student is not a patron, so the token must never be sent to FBS or FBI
 * as a user token; getPatronUserToken() does not return it. It reads the
 * Unilogin attributes the local Pubhub adapter needs, and is kept for digital
 * loans through the Biblio adapter (getDigitalLoanUserToken()).
 *
 * TODO(publizon-sunset): the Unilogin attributes serve the local Pubhub
 * adapter only; when the Publizon API is phased out the Biblio adapter
 * authenticates with the token alone.
 *
 * @param session - The session to log in.
 * @param userToken - The student's user token from the CMS.
 * @returns False if the Unilogin attributes could not be read, so no session
 *   was created.
 */
const saveUniloginSession = async (session: IronSession<TSessionData>, userToken: TUserToken) => {
  const uniLoginUserInfo = await loadUniloginUserInfo(userToken.token)
  if (!uniLoginUserInfo) {
    return false
  }

  await setSessionDefaults(session, userToken)
  session.uniLoginUserInfo = uniLoginUserInfo
  session.user = {
    // Unilogin does not provide a name.
    name: undefined,
    username: uniLoginUserInfo.uniid,
  }
  await session.save()
  return true
}

/**
 * Turn a user token from the CMS into a GO session of the token's type.
 *
 * @param session - The session to log in.
 * @param userToken - The user token from the CMS.
 * @returns False when no session could be created.
 */
export const saveSessionFromUserToken = async (
  session: IronSession<TSessionData>,
  userToken: TUserToken
) =>
  userToken.type === "unilogin"
    ? saveUniloginSession(session, userToken)
    : saveAdgangsplatformenSession(session, userToken)

/**
 * Check whether the user token behind a logged-in session has expired.
 *
 * Every logged in session lives on a user token from the CMS, whatever its
 * type, and lives exactly as long as that token (ADR-012, ADR-013).
 *
 * @param session - The session to check.
 * @returns True if the session is logged in and its token has expired.
 */
export const userTokenHasExpired = (session: IronSession<TSessionData>) => {
  if (userIsAnonymous(session)) {
    return false
  }
  // When the session was created we saved when we consider the access token to be expired.
  // If we are past that time, we consider the access token to be expired.
  if (session.expires && isPast(session.expires)) {
    return true
  }

  return false
}

/**
 * Check whether it is time to ask the CMS if the session is still alive.
 *
 * Drupal can retire a session while the services still accept its token - on
 * expiry, or when the patron logs out on the library site - and nothing in GO
 * can see that. So the CMS gets asked, but not on every single request.
 *
 * @param session - The session to check.
 * @returns True if the session is logged in and was not validated within the
 *   configured time.
 */
export const sessionShouldBeValidated = (session: IronSession<TSessionData> | TSessionData) => {
  if (userIsAnonymous(session)) {
    return false
  }

  if (!session.validatedAt) {
    return true
  }

  return isPast(
    add(session.validatedAt, { seconds: goConfig("auth.session-validation-ttl-seconds") })
  )
}

/**
 * Record that the CMS was asked whether the session is still alive.
 *
 * Records that we asked, not that the answer was yes: an unreachable CMS must
 * not turn into a request per page load.
 *
 * @param session - The session that was validated.
 */
export const markSessionValidated = async (session: IronSession<TSessionData>) => {
  session.validatedAt = new Date()
  await session.save()
}

/**
 * Delete the cookies that belong with the GO session, e.g. the session type.
 */
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

/**
 * Get the Drupal session cookie of the browser, if any.
 *
 * Note: finding this cookie only proves the browser HAS a Drupal session
 * cookie — not that the session behind it is still valid. Drupal may have
 * destroyed the session server-side (logout, expired token) while the cookie
 * lingers in the browser. Whether the user is actually logged in is settled by
 * what the CMS answers when the cookie is used (e.g. loadUserToken()).
 *
 * @returns The Drupal session cookie, or null if there is none.
 */
export const getDplCmsSessionCookie = async () => {
  const { cookies } = await import("next/headers")
  const cookieStore = await cookies()
  const allCookies = cookieStore.getAll()

  const sessionCookie = allCookies.find(cookie => cookie.name.startsWith("SSESS"))
  return sessionCookie ?? null
}

/**
 * Destroy the GO session and the cookies that belong with it.
 *
 * @param session - The session to destroy.
 */
export const destroySession = async (session: IronSession<TSessionData>) => {
  // ⁠await connection() is used to ensure that this function dynamically renders correctly, as ⁠session.destroy() only operates on the client.
  // https://nextjs.org/docs/app/api-reference/functions/connection
  await connection()
  // Destroy session and additional go-session cookies.
  session.destroy()
  await deleteGoSessionCookies()
}

/**
 * Destroy the GO session and send the user to the front page.
 *
 * @param session - The session to destroy.
 * @returns A redirect to the front page that reloads the session.
 */
export const destroySessionAndRedirectToFrontPage = async (session: IronSession<TSessionData>) => {
  await destroySession(session)
  return redirectToFrontPageAndReloadSession()
}

/**
 * Send the user to the front page, telling the client to reload the session.
 *
 * @returns A redirect to the front page with the reload-session parameter.
 */
export const redirectToFrontPageAndReloadSession = async () => {
  return NextResponse.redirect(`${getBaseURL()}?reload-session=true`)
}
