import { NextRequest, NextResponse } from "next/server"

import { TServiceType, getApServiceSettings, getApServiceUrl } from "@/lib/helpers/ap-service"
import { getSession } from "@/lib/session/session"

type TContext = { params: Promise<{ slug: string[] }> }

const getAuthHeader = async (request: NextRequest, serviceType: TServiceType) => {
  // If the request has an Authorization header, use it.
  const authHeader = request.headers.get("Authorization")
  if (authHeader) {
    return authHeader
  }

  // Otherwise, get the bearer token from the session.
  const useLibraryToken = getApServiceSettings(serviceType)?.useLibraryTokenAlways ?? true
  const session = await getSession()
  const userToken = session?.adgangsplatformenUserToken
  const libraryToken = session?.adgangsplatformenLibraryToken

  // If the settings (apServiceSettings) indicate that we should always use the library token,
  // we will use the library token if it exists.
  // Eg. the cover service always uses the library token because it does not need the user context.
  if (useLibraryToken && libraryToken) {
    return `Bearer ${libraryToken}`
  }

  // If we can load a user token we have an authenticated session,
  // and the user token has precedence over the library token.
  if (userToken) {
    return `Bearer ${userToken}`
  }

  // At last, if we have a library token (which we should always have) we will use that.
  if (libraryToken) {
    return `Bearer ${libraryToken}`
  }

  return null
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
  const baseUrl = getApServiceUrl(serviceType)

  if (!baseUrl) {
    return new Response("Not found", { status: 404 })
  }

  const urlParams = request.nextUrl.search ?? ""
  const url = [baseUrl, ...slug.slice(1)].join("/")
  const serviceUrl = `${url}${urlParams}`
  const authHeader = await getAuthHeader(request, serviceType)

  try {
    // Keep this for debugging purposes. TODO: Remove this when not needed.
    // eslint-disable-next-line no-console
    console.log({ authHeader })
    // eslint-disable-next-line no-console
    console.log({ proxiedHeaders })
    // eslint-disable-next-line no-console
    console.log({ serviceUrl })
    // eslint-disable-next-line no-console
    console.log({ method })
    // eslint-disable-next-line no-console
    console.log({ body })

    const result = await fetch(serviceUrl, {
      method,
      headers: {
        ...(authHeader ? { authorization: authHeader } : {}),
        ...proxiedHeaders,
      },
      body,
    })

    if (result.ok) {
      const json = await result.json()
      return new NextResponse(JSON.stringify(json), {
        status: result.status,
        headers: {
          ...request.headers,
        },
      })
    } else {
      return new NextResponse(null, {
        status: result.status,
      })
    }
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
