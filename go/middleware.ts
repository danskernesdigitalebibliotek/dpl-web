import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

import { getEnv } from "./lib/config/env"
import {
  getLibraryTokenCookieValue,
  loadLibraryToken,
  loadUserToken,
  setLibraryTokenCookie,
} from "./lib/helpers/tokens"
import {
  accessTokenShouldBeRefreshed,
  destroySession,
  getDplCmsSessionCookie,
  getSession,
  saveAdgangsplatformenSession,
} from "./lib/session/session"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const requestHeaders = new Headers(request.headers)

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

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

    const currentPath = new URL(pathname, appUrl.toString())
    return NextResponse.redirect(`${appUrl}/auth/token/refresh?redirect=${currentPath}`, {
      headers: response.headers,
    })
  }

  const libraryTokenCookieValue = await getLibraryTokenCookieValue()
  if (!libraryTokenCookieValue) {
    const libraryToken = await loadLibraryToken()
    // TODO: why is the loaded lib token undefined?
    const timestamp = libraryToken?.expire.timestamp
    const expires = timestamp ? new Date(timestamp * 1000) : false

    if (libraryToken && expires) {
      setLibraryTokenCookie(libraryToken.token, expires)
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!auth|_next|favicon.ico|favicon-*|sitemap.xml|robots.txt|site.webmanifest).*)",
  ],
}
