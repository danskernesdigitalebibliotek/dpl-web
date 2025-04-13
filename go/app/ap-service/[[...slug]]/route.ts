import { NextRequest, NextResponse } from "next/server"

import { TServiceType, getApServiceUrl } from "@/lib/helpers/ap-service"
import { getBearerTokenServerSide } from "@/lib/helpers/bearer-token"

type TContext = { params: Promise<{ slug: string[] }> }

const getAuthHeader = async (request: NextRequest, serviceType: TServiceType) => {
  // If the request has an Authorization header, use it.
  const authHeader = request.headers.get("Authorization")
  if (authHeader) {
    return authHeader
  }
  // Otherwise, get the bearer token from the session or library token cookie.
  const bearerToken = await getBearerTokenServerSide(serviceType)
  if (bearerToken) {
    return `Bearer ${bearerToken}`
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
  request.headers.forEach((value, key) => {
    proxiedHeaders[key] = value
  })

  const { slug } = await params
  const serviceType = slug.shift() as TServiceType
  const baseUrl = getApServiceUrl(serviceType)

  if (!baseUrl) {
    return new Response("Not found", { status: 404 })
  }

  const urlParams = request.nextUrl.search ?? ""
  const url = [baseUrl, ...slug].join("/")
  const serviceUrl = `${url}${urlParams}`
  const authHeader = await getAuthHeader(request, serviceType)

  try {
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
