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

    const responseHeaders: Record<string, string> = { "Content-Type": "application/json" }
    const cacheTagsHeader = goConfig("caching.dpl-cms.cachetags-header")
    const cacheTags = upstream.headers.get(cacheTagsHeader)
    if (cacheTags) responseHeaders[cacheTagsHeader] = cacheTags

    const text = await upstream.text()
    return new NextResponse(
      text || JSON.stringify({ errors: [{ message: "Empty upstream body" }] }),
      {
        status: upstream.status,
        headers: responseHeaders,
      }
    )
  } catch (error) {
    console.error("DPL CMS proxy error:", error)
    return NextResponse.json(
      { errors: [{ message: error instanceof Error ? error.message : "Proxy error" }] },
      { status: 500 }
    )
  }
}
