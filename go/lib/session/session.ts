import { getPatron } from "@danskernesdigitalebibliotek/dpl-service-layer"
import { add, isPast } from "date-fns"
import { IronSession, SessionOptions, getIronSession } from "iron-session"
import { unstable_rethrow } from "next/navigation"
import { NextResponse, connection } from "next/server"

import { CLIENT_COOKIE_OPTIONS, DEFAULT_COOKIE_OPTIONS } from "@/lib/config/cookies"
import { getServerEnv } from "@/lib/config/env"
import { getBaseURL } from "@/lib/config/getBaseURL"

import goConfig from "../config/goConfig"
import { isBuildingGoApp } from "../helpers/next-phase"
import { getServiceLayerConfig } from "../helpers/service-layer"
import { loadUniloginUserInfo } from "../helpers/unilogin"
import { userIsAnonymous } from "../helpers/user"
import { TSessionType, TUserToken } from "../types/session"

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
  adgangsplatformenUserToken?: string
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
  adgangsplatformenUserToken: undefined,
  adgangsplatformenLibraryToken: undefined,
  validatedAt: undefined,
  type: "anonymous",
}

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

    return session
  } catch (error) {
    // Try to follow unstable_rethrow advise in this post:
    // https://stackoverflow.com/questions/78010331/dynamic-server-usage-page-couldnt-be-rendered-statically-because-it-used-next
    unstable_rethrow(error)

    console.error("getSession error", error)
    return defaultSession as IronSession<TSessionData>
  }
}

const setSessionTypeCookie = async (type: TUserToken["type"]) => {
  const { cookies } = await import("next/headers")
  const cookieStore = await cookies()
  cookieStore.set(goConfig("auth.cookie-names.session-type"), type, CLIENT_COOKIE_OPTIONS)
}

const saveAdgangsplatformenSession = async (
  session: IronSession<TSessionData>,
  userToken: TUserToken
) => {
  session.isLoggedIn = true
  session.type = "adgangsplatformen"
  session.adgangsplatformenUserToken = userToken.token
  session.expires = new Date(userToken.expire.timestamp * 1000)
  await setSessionTypeCookie("adgangsplatformen")
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

// The student is not a patron, so the token is deliberately kept out of the
// session: it must never be sent to FBS or FBI as a user token. It is only
// used to read the Unilogin attributes the Pubhub adapter needs.
const saveUniloginSession = async (session: IronSession<TSessionData>, userToken: TUserToken) => {
  const uniLoginUserInfo = await loadUniloginUserInfo(userToken.token)
  if (!uniLoginUserInfo) {
    return false
  }

  session.isLoggedIn = true
  session.type = "unilogin"
  session.expires = new Date(userToken.expire.timestamp * 1000)
  session.uniLoginUserInfo = uniLoginUserInfo
  session.user = {
    // Unilogin does not provide a name.
    name: undefined,
    username: uniLoginUserInfo.uniid,
  }
  await setSessionTypeCookie("unilogin")
  await session.save()
  return true
}

// Turns a user token from the CMS into a GO session of the token's type.
// Returns false when no session could be created.
export const saveSessionFromUserToken = async (
  session: IronSession<TSessionData>,
  userToken: TUserToken
) =>
  userToken.type === "unilogin"
    ? saveUniloginSession(session, userToken)
    : saveAdgangsplatformenSession(session, userToken)

// Every logged in session lives on a user token from the CMS, whatever its
// type, and lives exactly as long as that token (ADR-012, ADR-013).
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

// Drupal can retire a session while the services still accept its token - on
// expiry, or when the patron logs out on the library site - and nothing in GO
// can see that. So the CMS gets asked, but not on every single request.
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

// Records that we asked, not that the answer was yes: an unreachable CMS must
// not turn into a request per page load.
export const markSessionValidated = async (session: IronSession<TSessionData>) => {
  session.validatedAt = new Date()
  await session.save()
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

// Note: finding this cookie only proves the browser HAS a Drupal session
// cookie — not that the session behind it is still valid. Drupal may have
// destroyed the session server-side (logout, expired token) while the cookie
// lingers in the browser. Whether the user is actually logged in is settled by
// what the CMS answers when the cookie is used (e.g. loadUserToken()).
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
