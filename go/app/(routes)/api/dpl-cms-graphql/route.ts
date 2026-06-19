import { NextRequest, NextResponse } from "next/server"

import { getEnv } from "@/lib/config/env"
import goConfig from "@/lib/config/goConfig"
import { getDplcmsGraphqlBasicAuthToken } from "@/lib/graphql/fetchers/dpl-cms.fetcher"

// Proxy for browser-originated DPL CMS GraphQL calls. Keeps DPL_CMS_BASE_URL
// server-only; basic auth is attached here so the browser never sees it.

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const baseUrl = getEnv("DPL_CMS_BASE_URL")
    if (!baseUrl) {
      return NextResponse.json(
        { errors: [{ message: "DPL_CMS_BASE_URL not configured" }] },
        { status: 500 }
      )
    }

    const upstream = await fetch(`${baseUrl}/graphql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${getDplcmsGraphqlBasicAuthToken()}`,
      },
      body,
    })

    const responseHeaders: Record<string, string> = {}
    const upstreamContentType = upstream.headers.get("content-type")
    if (upstreamContentType) responseHeaders["Content-Type"] = upstreamContentType
    const cacheTagsHeader = goConfig("caching.dpl-cms.cachetags-header")
    const cacheTags = upstream.headers.get(cacheTagsHeader)
    if (cacheTags) responseHeaders[cacheTagsHeader] = cacheTags

    // Pass through the upstream body and status verbatim. Don't synthesize a
    // JSON error envelope for empty bodies — that would corrupt a legitimate
    // 204 No Content and mask non-JSON error pages.
    const text = await upstream.text()
    return new NextResponse(text || null, {
      status: upstream.status,
      headers: responseHeaders,
    })
  } catch (error) {
    console.error("DPL CMS proxy error:", error)
    return NextResponse.json(
      { errors: [{ message: error instanceof Error ? error.message : "Proxy error" }] },
      { status: 500 }
    )
  }
}
