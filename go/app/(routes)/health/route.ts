import { isEmpty } from "lodash"
import { NextResponse, connection } from "next/server"
import { readFile } from "node:fs/promises"

import goConfig from "@/lib/config/goConfig"
import { loadPageData } from "@/lib/helpers/dpl-cms-content"

type TRequestsNames = "frontpage"

type THealthStatusRequestBody = {
  version: "unknown" | string
  requests:
    | {
        [key in TRequestsNames]: {
          status: "ok" | "error"
          message: string
        }
      }
    | Record<string, never>
}

async function getHealthStatus() {
  await connection() // Opt into dynamic rendering
  const requestBody: THealthStatusRequestBody = {
    version: "unknown",
    requests: {},
  }

  try {
    // /app/VERSION is baked into the base image at build time
    // (see go/lagoon/base.dockerfile).
    requestBody.version = (await readFile("/app/VERSION", "utf8")).trim()
  } catch {}

  try {
    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    const { go, ...frontpageData } = await loadPageData({
      contentPath: goConfig("routes.frontpage"),
      type: "page",
    })

    if (isEmpty(frontpageData)) {
      throw new Error("Frontpage data is empty")
    }

    requestBody.requests.frontpage = {
      status: "ok",
      message: "Frontpage data loaded successfully",
    }
  } catch (error) {
    requestBody.requests.frontpage = {
      status: "error",
      message: `Error loading frontpage data: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
    return NextResponse.json(requestBody, { status: 500 })
  }

  return NextResponse.json(requestBody, { status: 200 })
}

export const GET = getHealthStatus
