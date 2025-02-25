import { NextResponse } from "next/server"
import type { NextFetchEvent, NextRequest } from "next/server"

import loadUserToken from "./app/auth/callback/adgangsplatformen/loadUserToken"
import goConfig from "./lib/config/goConfig"
import {
  accessTokenShouldBeRefreshed,
  getDplCmsSessionCookie,
  getSession,
  saveAdgangsplatformenSession,
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

  // If the session is not logged in we will try to see
  // if we have an ongoing Adgangsplatformen Drupal session.
  // If we have an active Drupal session we will try to load the user token from dpl-cms.
  if (!session.isLoggedIn) {
    const tokenData = await loadUserToken()
    if (tokenData) {
      await saveAdgangsplatformenSession(session, tokenData)
    }
  }

  // Destroy the session if we have an active session but no dpl cms session cookie.
  if (session.isLoggedIn && session.type === "adgangsplatformen") {
    const sessionCookie = await getDplCmsSessionCookie()
    if (!sessionCookie) {
      session.destroy()
    }
  }

  // If the Adgangsplatformen user token is about to expire we will reload it from dpl-cms.
  // TODO: Investigate if we have a better way to handle this. Eg. force the dpl-cms to refresh the token.
  if (accessTokenShouldBeRefreshed(session, "adgangsplatformen")) {
    const tokenData = await loadUserToken()
    if (tokenData) {
      await saveAdgangsplatformenSession(session, tokenData)
    }
  }

  if (accessTokenShouldBeRefreshed(session, "unilogin")) {
    const currentPath = new URL(request.nextUrl.pathname, goConfig("app.url")).toString()
    const url = goConfig("app.url")
    return NextResponse.redirect(`${url}/auth/token/refresh?redirect=${currentPath}`, {
      headers: response.headers,
    })
  }

  return response
}
