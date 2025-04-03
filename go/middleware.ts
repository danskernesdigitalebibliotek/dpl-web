import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

import { getEnv } from "./lib/config/env"
import { ensureLibraryTokenExist } from "./lib/helpers/middleware"
import { loadUserToken } from "./lib/helpers/tokens"
import { userIsAnonymous, userIsLoggedInAtDplCms } from "./lib/helpers/user"
import { getUniloginClientConfig } from "./lib/session/oauth/uniloginClient"
import {
  adgangsplatformenAccessTokenShouldBeRefreshed,
  destroySession,
  getDplCmsSessionCookie,
  getSession,
  refreshUniloginTokens,
  saveAdgangsplatformenSession,
  uniloginAccessTokenShouldBeRefreshed,
} from "./lib/session/session"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const requestHeaders = new Headers(request.headers)

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  // Make sure we have a library token cookie.
  await ensureLibraryTokenExist()

  const session = await getSession({ request, response })

  // Destroy the session if we have an active session but no dpl cms session cookie.
  if (!userIsAnonymous(session) && session.type === "adgangsplatformen") {
    const sessionCookie = await getDplCmsSessionCookie()
    if (!sessionCookie) {
      destroySession(session)
    }
  }

  // If the session is not logged in we will try to see if we have an ongoing Adgangsplatformen Drupal session.
  // If we have an active Drupal session we will try to load the user token from dpl-cms.
  // OR:
  // If the Adgangsplatformen user token is about to expire we will reload it from dpl-cms.
  const userIsLoggedInAtCms = await userIsLoggedInAtDplCms()
  if (
    (userIsAnonymous(session) && userIsLoggedInAtCms) ||
    adgangsplatformenAccessTokenShouldBeRefreshed(session)
  ) {
    const appUrl = getEnv("APP_URL")
    const currentPath = new URL(pathname, appUrl.toString())

    const tokenData = await loadUserToken()
    if (tokenData) {
      await saveAdgangsplatformenSession(session, tokenData)
      return NextResponse.redirect(currentPath, { headers: requestHeaders })
    }
  }

  // @todo - Handle refresh_expires
  if (uniloginAccessTokenShouldBeRefreshed(session)) {
    const config = await getUniloginClientConfig()
    const appUrl = getEnv("APP_URL")
    const currentPath = new URL(pathname, appUrl.toString())
    if (config) {
      refreshUniloginTokens(session, config)
      return NextResponse.redirect(currentPath, { headers: requestHeaders })
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
