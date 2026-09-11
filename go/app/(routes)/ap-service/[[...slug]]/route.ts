import { NextRequest, NextResponse } from "next/server"

import { TServiceType, getApServiceSettings, getApServiceUrl } from "@/lib/helpers/ap-service"
import { userIsAnonymous } from "@/lib/helpers/user"
import {
  adgangsplatformenAccessTokenHasExpired,
  destroySession,
  getSession,
} from "@/lib/session/session"

type TContext = { params: Promise<{ slug: string[] }> }

// What getAuthHeader chose to send. Only a rejection of the session's own
// user token may tear down the session — library-token calls and
// passed-through Authorization headers say nothing about the session's
// health.
type TResolvedAuth =
  | { header: string; source: "request-header" | "user-token" | "library-token" }
  | { header: null; source: "none" }

const getAuthHeader = async (
  request: NextRequest,
  serviceType: TServiceType
): Promise<TResolvedAuth> => {
  // If the request has an Authorization header, use it.
  const authHeader = request.headers.get("Authorization")
  if (authHeader) {
    return { header: authHeader, source: "request-header" }
  }

  // Otherwise, get the bearer token from the session.
  // The default is the library token, so a user token is never sent to a
  // service that has not explicitly opted into user context.
  const useLibraryToken = getApServiceSettings(serviceType)?.useLibraryTokenAlways ?? true
  const session = await getSession()
  const userToken = session?.adgangsplatformenUserToken
  const libraryToken = session?.adgangsplatformenLibraryToken

  // The middleware does not run on this route, so we check for an expired
  // session here as well. If it has expired we destroy it and skip the user
  // token — the service would reject it anyway.
  const sessionHasExpired = adgangsplatformenAccessTokenHasExpired(session)
  if (sessionHasExpired) {
    await destroySession(session)
  }

  // If the settings (apServiceSettings) indicate that we should always use the library token,
  // we will use the library token if it exists.
  // For services that do not need the user context.
  if (useLibraryToken && libraryToken) {
    return { header: `Bearer ${libraryToken}`, source: "library-token" }
  }

  // If we can load a user token we have an authenticated session,
  // and the user token has precedence over the library token.
  if (userToken && !sessionHasExpired) {
    return { header: `Bearer ${userToken}`, source: "user-token" }
  }

  // At last, if we have a library token (which we should always have) we will use that.
  if (libraryToken) {
    return { header: `Bearer ${libraryToken}`, source: "library-token" }
  }

  return { header: null, source: "none" }
}

async function proxyRequest(
  request: NextRequest,
  method: string,
  { params }: TContext,
  body?: string
) {
  const proxiedHeaders: Record<string, string> = {}
  // No need to send along the cookies.
  const headersToIgnore = ["cookie"]
  request.headers.forEach((value, key) => {
    if (headersToIgnore.includes(key.toLowerCase())) {
      return
    }

    proxiedHeaders[key] = value
  })

  const { slug } = await params
  const serviceType = slug[0] as TServiceType
  const baseUrl = await getApServiceUrl(serviceType)

  if (!baseUrl) {
    return new Response("Not found", { status: 404 })
  }

  const urlParams = request.nextUrl.search ?? ""
  const url = [baseUrl, ...slug.slice(1)].join("/")
  const serviceUrl = `${url}${urlParams}`
  const auth = await getAuthHeader(request, serviceType)

  try {
    const result = await fetch(serviceUrl, {
      method,
      headers: {
        ...(auth.header ? { authorization: auth.header } : {}),
        ...proxiedHeaders,
      },
      body,
    })

    // The upstream rejected the session's own user token — expired on the
    // clock or revoked with a future expire (the middleware can only catch
    // the former). Destroy the GO session so /auth/session reports logged
    // out instead of letting clients retry with the same dead token forever.
    // Only Adgangsplatformen sessions carry a user token here; Unilogin
    // sessions are untouched.
    if (auth.source === "user-token" && (result.status === 401 || result.status === 403)) {
      const session = await getSession()
      if (!userIsAnonymous(session) && session.type === "adgangsplatformen") {
        await destroySession(session)
      }
    }

    // Some FBS endpoints return 204 No Content (e.g. DELETE) — calling .json()
    // on an empty body throws. Pass the raw text through; clients that expect
    // JSON parse it themselves.
    const text = await result.text()
    return new NextResponse(text || null, {
      status: result.status,
      headers: {
        ...request.headers,
      },
    })
  } catch (error) {
    console.error("Error", error)
    return new NextResponse(null, {
      status: 500,
    })
  }
}

// Export named functions for each HTTP method
export async function GET(request: NextRequest, context: TContext) {
  return await proxyRequest(request, "GET", context)
}
export async function POST(request: NextRequest, context: TContext) {
  try {
    const body = await request.json()
    return await proxyRequest(request, "POST", context, JSON.stringify(body))
  } catch {
    return await proxyRequest(request, "POST", context)
  }
}
export async function PUT(request: NextRequest, context: TContext) {
  return await proxyRequest(request, "PUT", context)
}
export async function PATCH(request: NextRequest, context: TContext) {
  return await proxyRequest(request, "PATCH", context)
}
export async function DELETE(request: NextRequest, context: TContext) {
  return await proxyRequest(request, "DELETE", context)
}
