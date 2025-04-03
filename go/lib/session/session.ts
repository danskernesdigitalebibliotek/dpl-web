import { add, isPast, sub } from "date-fns"
import { IronSession, getIronSession } from "iron-session"
import { NextRequest, NextResponse } from "next/server"
import * as client from "openid-client"
import { z } from "zod"

import { getEnv, getServerEnv } from "../config/env"
import goConfig from "../config/goConfig"
import { userIsAnonymous } from "../helpers/user"
import { TSessionType, TUniloginTokenSet } from "../types/session"

export const getSessionOptions = async () => {
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
  userInfo?: {
    sub: string
    uniid: string
    institution_ids: string[]
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
  const { cookies } = await import("next/headers")
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
  expire: number
}

export const setAdgangsplatformenUserTokenOnSession = async (
  session: IronSession<TSessionData>,
  token: TAdgangsplatformenUserToken
) => {
  const { cookies } = await import("next/headers")

  session.adgangsplatformenUserToken = token.token
  session.expires = new Date(token.expire * 1000)
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
  await session.save()
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
  // Destroy session and additional go-session cookies.
  session.destroy()
  await deleteGoSessionCookies()
}

export const destroySessionAndRedirectToFrontPage = async (session: IronSession<TSessionData>) => {
  await destroySession(session)
  return redirectToFrontPageAndReloadSession()
}

export const redirectToFrontPageAndReloadSession = async () => {
  const appUrl = new URL(getEnv("APP_URL"))

  return NextResponse.redirect(`${appUrl.toString()}?reload-session=true`)
}

export const refreshUniloginTokens = async (
  session: IronSession<TSessionData>,
  config: client.Configuration
) => {
  const sessionTokenSchema = z.object({
    isLoggedIn: z.boolean(),
    access_token: z.string(),
    refresh_token: z.string(),
  })

  try {
    // TODO: Consider if we want to handle different types of sessions than unilogin.
    const tokens = sessionTokenSchema.parse(session)
    const newTokens = (await client.refreshTokenGrant(
      config,
      tokens.refresh_token
    )) as unknown as TUniloginTokenSet
    await setUniloginTokensOnSession(session, newTokens)
    await session.save()
  } catch (error) {
    // Session is corrupt so we need to destroy it.
    session.destroy()

    const isZodError = error instanceof z.ZodError
    console.error(isZodError ? JSON.stringify(error.errors) : error)
  }
}
