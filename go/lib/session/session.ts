import { add, isPast, sub } from "date-fns"
import { IronSession, getIronSession } from "iron-session"
import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

import goConfig from "../config/goConfig"
import { TSessionType, TUniloginTokenSet } from "../types/session"

export const getSessionOptions = async () => {
  const sessionSecret = process.env.GO_SESSION_SECRET ?? null

  if (!sessionSecret) {
    console.error("Missing Go session secret")
    return null
  }

  return {
    password: sessionSecret,
    cookieName: "go-session",
    cookieOptions: {
      // secure only works in `https` environments
      // if your localhost is not on `https`, then use: `secure: process.env.NODE_ENV === "production"`
      secure: process.env.NODE_ENV === "production",
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
  userInfo?: {
    sub: string
    uniid: string
    institution_ids: string
  }
  adgangsplatformenUserToken?: string
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
  userInfo: undefined,
  adgangsplatformenUserToken: undefined,
  type: "anonymous",
}

export async function getSession(options?: {
  request: NextRequest
  response: NextResponse
}): Promise<IronSession<TSessionData>> {
  const sessionOptions = await getSessionOptions()
  if (!sessionOptions) {
    return defaultSession as IronSession<TSessionData>
  }

  try {
    const session = !options
      ? await getIronSession<TSessionData>(await cookies(), sessionOptions)
      : await getIronSession<TSessionData>(options.request, options.response, sessionOptions)

    if (!session?.isLoggedIn) {
      // Return the default session if the session is not logged in.
      // But if the session has a code_verifier, we will keep that.
      // The code_verifier is used for verifying the PKCE challenge
      // when coming back from Unilogin.
      return Object.assign(session, defaultSession, {
        ...(session.code_verifier ? { code_verifier: session.code_verifier } : {}),
      }) as IronSession<TSessionData>
    }

    return session
  } catch (error) {
    console.error(error)
    return defaultSession as IronSession<TSessionData>
  }
}

export const setUniloginTokensOnSession = async (
  session: IronSession<TSessionData>,
  tokenSet: TUniloginTokenSet
) => {
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
  cookieStore.set(goConfig("auth.id-token"), tokenSet.id_token)
}

type TAdgangsplatformenUserToken = {
  token: string
  expire: number
}

export const setAdgangsplatformenUserTokenOnSession = async (
  session: IronSession<TSessionData>,
  token: TAdgangsplatformenUserToken
) => {
  session.adgangsplatformenUserToken = token.token
  session.expires = add(new Date(), {
    seconds: token.expire,
  })
}

export const saveAdgangsplatformenSession = async (
  session: IronSession<TSessionData>,
  userToken: TAdgangsplatformenUserToken
) => {
  session.isLoggedIn = true
  session.type = "adgangsplatformen"
  setAdgangsplatformenUserTokenOnSession(session, userToken)
  await session.save()
}

export const accessTokenShouldBeRefreshed = (
  session: IronSession<TSessionData>,
  sessionType: TSessionType
) => {
  // If the session is not logged in, or it is not of the specified type
  // we don't need to refresh the access token.
  if (!session.isLoggedIn || session.type !== sessionType || !session.refresh_token) {
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

  if (bufferedExp.expires && isPast(bufferedExp.expires)) {
    return true
  }

  return false
}

export const accessTokenIsExpired = (session: IronSession<TSessionData>) => {
  // We need the timestamps to be set to consider the session expired.
  // If they are not available, we consider the session expired.
  if (!session.expires || !session.refresh_expires) {
    return true
  }

  return session.expires && isPast(session.expires)
}

export const getUniloginIdToken = async () =>
  (await cookies()).get(goConfig("auth.id-token"))?.value

export const deleteUniloginIdToken = async () => (await cookies()).delete(goConfig("auth.id-token"))

export const getDplCmsSessionCookie = async () => {
  const cookieStore = await cookies()
  const allCookies = cookieStore.getAll()

  const sessionCookie = allCookies.find(cookie => cookie.name.startsWith("SSESS"))
  return sessionCookie ?? null
}

export const destroySession = async (session: IronSession<TSessionData>) => {
  // Destroy session and id token.
  session.destroy()
  const id_token = await getUniloginIdToken()
  if (id_token) {
    await deleteUniloginIdToken()
  }
}

export const destroySessionAndRedirectToFrontPage = async (session: IronSession<TSessionData>) => {
  await destroySession(session)
  return redirectToFrontPageAndReloadSession()
}

export const redirectToFrontPageAndReloadSession = async () => {
  const appUrl = new URL(String(goConfig("app.url")))

  return NextResponse.redirect(`${appUrl.toString()}?reload-session=true`)
}
