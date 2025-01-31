import { add, isPast, sub } from "date-fns"
import { IronSession, getIronSession } from "iron-session"
import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

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
    institutionIds: string
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
  // cookies().set("go-session:id_token", tokenSet.id_token)
  const cookieStore = await cookies()
  cookieStore.set("go-session:id_token", tokenSet.id_token)
}

export const setAdgangsplatformenUserTokenOnSession = async (
  session: IronSession<TSessionData>,
  token: string
) => {
  session.adgangsplatformenUserToken = token
  session.expires = add(new Date(), {
    // Three weeks.
    // TODO: Get TTL from the tokenSet (API should return it).
    seconds: 3 * 7 * 24 * 60 * 60,
  })
}

export const accessTokenShouldBeRefreshed = (session: IronSession<TSessionData>) => {
  // If the session is not logged in, we don't need to refresh the access token.
  if (!session.isLoggedIn) {
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
