import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

import { getBaseURL } from "@/lib/config/getBaseURL"

import goConfig from "./lib/config/goConfig"
import { ensureLibraryTokenExist } from "./lib/helpers/middleware"
import { userIsAnonymous } from "./lib/helpers/user"
import { loadUserToken } from "./lib/helpers/user-token"
import {
  destroySession,
  getDplCmsSessionCookie,
  getSession,
  markSessionValidated,
  saveSessionFromUserToken,
  sessionShouldBeValidated,
  userTokenHasExpired,
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

  if (protectedPages.includes(currentPath)) {
    // If the user is anonymous, we will redirect to the front page.
    // @todo Write a test in the middleware test suite to ensure this works.
    if (userIsAnonymous(session)) {
      return NextResponse.redirect(getBaseURL())
    }
  }

  // Destroy the session if we have an active session but no dpl cms session cookie.
  // Both Adgangsplatformen and Unilogin sessions live on the Drupal session.
  if (!userIsAnonymous(session)) {
    const sessionCookie = await getDplCmsSessionCookie()
    if (!sessionCookie) {
      await destroySession(session)
      return response
    }
  }

  if (userTokenHasExpired(session)) {
    // Drupal logs out patrons whose token has expired, so the CMS stops
    // answering for this session and cannot hand the dead token back. Tearing
    // down the GO session is therefore enough: the next request is anonymous
    // and stays that way.
    await destroySession(session)
    return response
  }

  // If the session is not logged in, ask dpl-cms whether the browser's Drupal
  // session cookie still represents a logged-in user with a live token.
  // loadUserToken() settles that, and answers without calling the CMS when
  // there is no cookie to go on. There is no refresh path: the CMS cannot
  // renew the token, so the GO session lives exactly as long as the user
  // token — a dead token means a new login. The token type decides the
  // session type. If no session could be created (the Unilogin userinfo could
  // not be read), the visitor stays anonymous and the next request tries again.
  if (userIsAnonymous(session)) {
    const tokenData = await loadUserToken()
    if (tokenData.status === "token") {
      await saveSessionFromUserToken(session, tokenData.data)
      return response
    }
  }

  // Drupal can retire the session before the token's own expiry runs out: it
  // logs out patrons with an expired token, and a patron can log out on the
  // library site. Neither is visible to GO's copy of the expiry, and the
  // services keep accepting the token, so the CMS is the only party that
  // knows. Ask it, at most every 30 seconds per session. An error leaves the
  // session alone: it says nothing about the patron, and logging people out
  // because the CMS blinked would be worse than showing them a stale page.
  // A token of another type means somebody else has logged in on the CMS in
  // this browser, e.g. a parent after a student. That ends this session too.
  if (sessionShouldBeValidated(session)) {
    const tokenData = await loadUserToken()
    if (
      tokenData.status === "no-token" ||
      (tokenData.status === "token" && tokenData.data.type !== session.type)
    ) {
      await destroySession(session)
      return response
    }
    await markSessionValidated(session)
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
