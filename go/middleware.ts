import { NextResponse } from "next/server"
import type { NextFetchEvent, NextRequest } from "next/server"
import { z } from "zod"

import loadUserToken from "./app/auth/callback/adgangsplatformen/loadUserToken"
import goConfig from "./lib/config/goConfig"
import {
  getSession,
  saveAdgangsplatformenSession,
  uniLoginAccessTokenShouldBeRefreshed,
} from "./lib/session/session"

export async function middleware(request: NextRequest, event: NextFetchEvent) {
  const { pathname } = request.nextUrl
  const response = NextResponse.next()

  if (pathname.startsWith("/_next") || pathname.startsWith("/auth")) {
    return response
  }

  const session = await getSession({ request, response })

  // TODO: Check if we need to destroy the session if the refresh token is expired.
  // const session = await getIronSession<TSessionData>(request, response, sessionOptions);
  // const isExpired = accessTokenIsExpired(session);
  // console.log({ isExpired });
  // if (isExpired) {
  //   session.destroy();
  //   return NextResponse.redirect(new URL('/', request.url), { headers: response.headers });
  // }

  if (!session.isLoggedIn) {
    const tokenData = await loadUserToken()

    const validation = z
      .object({
        token: z.string(),
        expire: z.number(),
      })
      .safeParse(tokenData)

    if (validation.success) {
      await saveAdgangsplatformenSession(session, validation.data)
    }
  }

  if (uniLoginAccessTokenShouldBeRefreshed(session)) {
    const currentPath = new URL(request.nextUrl.pathname, goConfig("app.url")).toString()
    const url = goConfig("app.url")
    return NextResponse.redirect(`${url}/auth/token/refresh?redirect=${currentPath}`, {
      headers: response.headers,
    })
  }

  return response
}
