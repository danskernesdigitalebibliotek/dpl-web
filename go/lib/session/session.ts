import { add, isPast, sub } from "date-fns"
import { IronSession, SessionOptions, getIronSession } from "iron-session"
import { unstable_rethrow } from "next/navigation"
import { NextResponse, connection } from "next/server"

import { getEnv, getServerEnv } from "@/lib/config/env"
import { getBaseURL } from "@/lib/config/getBaseURL"

import goConfig from "../config/goConfig"
import { isBuildingGoApp } from "../helpers/next-phase"
import { loadPatronServerSide } from "../helpers/service-layer"
import { userIsAnonymous } from "../helpers/user"
import { TSessionType, TUniloginTokenSet } from "../types/session"

export const getSessionOptions = (): SessionOptions => {
  const sessionSecret = getServerEnv("GO_SESSION_SECRET")

  return {
    password: sessionSecret,
    cookieName: "go-session",
    cookieOptions: {
      // secure only works in `https` environments
      secure: getEnv("NODE_ENV") === "production",
    },
    // TODO: Decide on the session ttl.
    ttl: 60 * 60 * 24 * 7, // 1 week
  }
}

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

export async function getSession(): Promise<IronSession<TSessionData>> {
  // If we are building the go app, we will use the default session to simulate an anonymous user.
  if (isBuildingGoApp()) {
    return defaultSession as IronSession<TSessionData>
  }

  const sessionOptions = await getSessionOptions()
  if (!sessionOptions) {
    return defaultSession as IronSession<TSessionData>
  }

  try {
    const { cookies } = await import("next/headers")
    const cookieStore = await cookies()
    const libraryToken = cookieStore.get(goConfig("library-token.cookie-name"))?.value
    const session = await getIronSession<TSessionData>(cookieStore, sessionOptions)

    if (!session?.isLoggedIn) {
      // Return the default session if the session is not logged in.
      // But if the session has a code_verifier, we will keep that.
      // The code_verifier is used for verifying the PKCE challenge
      // when coming back from Unilogin.
      return Object.assign(session, defaultSession, {
        ...(session.code_verifier ? { code_verifier: session.code_verifier } : {}),
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

export const setUniloginTokensOnSession = async (
  session: IronSession<TSessionData>,
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
  session: IronSession<TSessionData>,
  token: TAdgangsplatformenUserToken
) => {
  const { cookies } = await import("next/headers")

  session.adgangsplatformenUserToken = token.token
  session.expires = new Date(token.expire.timestamp * 1000)
  const cookieStore = await cookies()
  cookieStore.set(goConfig("auth.cookie-names.session-type"), "adgansplatformen")
}

export const saveAdgangsplatformenSession = async (
  session: IronSession<TSessionData>,
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
