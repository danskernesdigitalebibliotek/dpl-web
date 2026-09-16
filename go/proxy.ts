import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

import { getBaseURL } from "@/lib/config/getBaseURL"

import goConfig from "./lib/config/goConfig"
import { refreshUniloginTokens } from "./lib/helpers/bearer-token"
import { ensureLibraryTokenExist } from "./lib/helpers/middleware"
import { hasDplCmsSessionCookie, userIsAnonymous } from "./lib/helpers/user"
import { loadUserToken } from "./lib/helpers/user-token"
import { getUniloginClientConfig } from "./lib/session/oauth/uniloginClient"
import {
  adgangsplatformenAccessTokenHasExpired,
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
      return NextResponse.redirect(getBaseURL())
    }
  }

  // Destroy the session if we have an active session but no dpl cms session cookie.
  if (!userIsAnonymous(session) && session.type === "adgangsplatformen") {
    const sessionCookie = await getDplCmsSessionCookie()
    if (!sessionCookie) {
      await destroySession(session)
    }
  }

  if (adgangsplatformenAccessTokenHasExpired(session)) {
    // Drupal logs out patrons whose token has expired, so the CMS stops
    // answering for this session and cannot hand the dead token back. Tearing
    // down the GO session is therefore enough: the next request is anonymous
    // and stays that way.
    await destroySession(session)
    return response
  }

  // If the session is not logged in but the browser carries a Drupal session
  // cookie, we will try to load the user token from dpl-cms. loadUserToken()
  // settles whether the cookie still represents a logged-in user with a live
  // token — a lingering cookie for a dead or expired session yields no token.
  // There is no refresh path: the CMS cannot renew the token, so the GO
  // session lives exactly as long as the user token — a dead token means a
  // new login.
  if (userIsAnonymous(session) && (await hasDplCmsSessionCookie())) {
    const tokenData = await loadUserToken()
    if (tokenData.status === "token") {
      await saveAdgangsplatformenSession(session, tokenData.data)
      return response
    }
  }

  // Drupal can retire the session before the token's own expiry runs out: it
  // logs out patrons with an expired token, and a patron can log out on the
  // library site. Neither is visible to GO's copy of the expiry, and the
  // services keep accepting the token, so the CMS is the only party that
  // knows. Ask it on top-level navigations — one call per page view, not per
  // prefetch. An error leaves the session alone: it says nothing about the
  // patron, and logging people out because the CMS blinked would be worse
  // than showing them a stale page.
  if (
    !userIsAnonymous(session) &&
    session.type === "adgangsplatformen" &&
    request.headers.get("sec-fetch-dest") === "document"
  ) {
    const tokenData = await loadUserToken()
    if (tokenData.status === "no-token") {
      await destroySession(session)
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
