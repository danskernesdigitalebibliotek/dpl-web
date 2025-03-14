import { NextResponse } from "next/server"
import type { NextFetchEvent, NextRequest } from "next/server"

import loadUserToken from "./app/auth/callback/adgangsplatformen/loadUserToken"
import { getEnv } from "./lib/config/env"
import {
  accessTokenIsExpired,
  accessTokenShouldBeRefreshed,
  destroySession,
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

  // Apparently the timespan is too short for the session to be expired.
  // The result is that the session is destroyed too soon.
  // @todo: Investigate how to increase the timespan for the session.
  // If the session is expired then destroy it.
  // if (accessTokenIsExpired(session)) {
  //   destroySession(session)
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
      destroySession(session)
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
    const appUrl = getEnv("APP_URL")

    const currentPath = new URL(request.nextUrl.pathname, appUrl.toString())
    return NextResponse.redirect(`${appUrl}/auth/token/refresh?redirect=${currentPath}`, {
      headers: response.headers,
    })
  }

  return response
}
