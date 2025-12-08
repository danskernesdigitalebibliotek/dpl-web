import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

import { getEnv } from "./lib/config/env"
import goConfig from "./lib/config/goConfig"
import { refreshUniloginTokens } from "./lib/helpers/bearer-token"
import { ensureLibraryTokenExist } from "./lib/helpers/middleware"
import { userIsAnonymous, userIsLoggedInAtDplCms } from "./lib/helpers/user"
import { loadUserToken } from "./lib/helpers/user-token"
import { getUniloginClientConfig } from "./lib/session/oauth/uniloginClient"
import {
  adgangsplatformenAccessTokenHasExpired,
  adgangsplatformenAccessTokenShouldBeRefreshed,
  destroySession,
  getDplCmsSessionCookie,
  getSession,
  removePCKECodeVerifierFromSession,
  saveAdgangsplatformenSession,
  sessionHasPKCECodeVerifier,
  uniloginAccessTokenHasExpired,
  uniloginAccessTokenShouldBeRefreshed,
} from "./lib/session/session"

// These pages require a logged-in user.
// The user gets redirected to the front page if they are not logged in.
const protectedPages = [`/${goConfig("routes.user-profile")}`]

export async function proxy(request: NextRequest) {
  const currentPath = request.nextUrl.pathname
  const requestHeaders = new Headers(request.headers)
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  // Make sure we have a library token cookie.
  await ensureLibraryTokenExist(request)

  const session = await getSession()

  // Since we do not need the PKCE code verifier on non-auth routes,
  // we will remove it from the session if it exists.
  // It is safe because the middleware only runs on non-auth routes.
  if (sessionHasPKCECodeVerifier(session)) {
    await removePCKECodeVerifierFromSession(session)
  }

  if (protectedPages.includes(currentPath)) {
    // If the user is anonymous, we will redirect to the front page.
    // @todo Write a test in the middleware test suite to ensure this works.
    if (userIsAnonymous(session)) {
      return NextResponse.redirect(getEnv("APP_URL"))
    }
  }

  // Destroy the session if we have an active session but no dpl cms session cookie.
  if (!userIsAnonymous(session) && session.type === "adgangsplatformen") {
    const sessionCookie = await getDplCmsSessionCookie()
    if (!sessionCookie) {
      destroySession(session)
    }
  }

  if (adgangsplatformenAccessTokenHasExpired(session)) {
    destroySession(session)
    return response
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
    const tokenData = await loadUserToken()
    if (tokenData) {
      await saveAdgangsplatformenSession(session, tokenData)
      return response
    }
  }

  if (uniloginAccessTokenHasExpired(session)) {
    destroySession(session)
    return response
  }

  if (uniloginAccessTokenShouldBeRefreshed(session)) {
    const config = await getUniloginClientConfig()
    if (config) {
      refreshUniloginTokens(session, config)
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - auth (Authentication routes)
     * - ap-service (Adgangsplatform service proxy route)
     * - health (Health check route)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!auth|ap-service|health|_next|favicon.ico|favicon-*|sitemap.xml|robots.txt|site.webmanifest).*)",
  ],
}
