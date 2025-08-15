import { promises as fs } from "fs"
import { isEmpty } from "lodash"
import { NextResponse } from "next/server"

import goConfig from "@/lib/config/goConfig"
import { loadPageData } from "@/lib/helpers/dpl-cms-content"

type TRequestsNames = "frontpage"

type THealthStatusRequestBody = {
  version: "unknown" | `${number}.${number}.${number}`
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
  const requestBody: THealthStatusRequestBody = {
    version: "unknown",
    requests: {},
  }

  try {
    // Get version from .version json file in root of project. .version file should only exist in lagoon.
    const jsonFile = await fs.readFile(".version", "utf8")
    requestBody.version = JSON.parse(jsonFile).version
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: `Error reading version file: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 }
    )
  }

  try {
    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    const { go, ...frontpageData } = await loadPageData({
      contentPath: goConfig("routes.frontpage"),
      type: "page",
    })

    if (!isEmpty(frontpageData)) {
      requestBody.requests.frontpage = {
        status: "ok",
        message: "Frontpage data loaded successfully",
      }
    } else {
      requestBody.requests.frontpage = {
        status: "error",
        message: `Frontpage data is empty`,
      }

      return NextResponse.json(requestBody, { status: 500 })
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

export const dynamic = "force-dynamic"
