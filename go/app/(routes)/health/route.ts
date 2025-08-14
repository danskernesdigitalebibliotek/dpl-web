import { promises as fs } from "fs"
import { isEmpty } from "lodash"
import { NextResponse } from "next/server"

import goConfig from "@/lib/config/goConfig"
import { loadPageData } from "@/lib/helpers/dpl-cms-content"

type HealthStatusRequest = {
  function: string
  route: string
  status: "ok" | "error"
  message: string
}

type HealthStatusRequestBody = {
  version: string
  requests: HealthStatusRequest[]
}

async function getHealthStatus() {
  const requestBody: HealthStatusRequestBody = {
    version: "",
    requests: [],
  }

  try {
    // Get version from .version json file in root of project. .version file should only exist in lagoon.
    const jsonFile = await fs.readFile(".version", "utf8")
    requestBody.version = JSON.parse(jsonFile).version
  } catch (error) {
    requestBody.version = `Error reading version: ${error instanceof Error ? error.message : "Unknown error"}`
  }

  try {
    const frontpageData = await loadPageData({
      contentPath: goConfig("routes.frontpage"),
      type: "page",
    })

    const { ...data } = frontpageData

    if (!isEmpty(data)) {
      requestBody.requests.push({
        function: "loadPageData",
        route: goConfig("routes.frontpage"),
        status: "ok",
        message: "Frontpage data loaded successfully",
      })
    } else {
      requestBody.requests.push({
        function: "loadPageData",
        route: goConfig("routes.frontpage"),
        status: "error",
        message: `Frontpage data is empty`,
      })
    }
  } catch (error) {
    requestBody.requests.push({
      function: "loadPageData",
      route: goConfig("routes.frontpage"),
      status: "error",
      message: `Error loading frontpage data: ${error instanceof Error ? error.message : "Unknown error"}`,
    })
  }

  return NextResponse.json(requestBody, { status: 200 })
}

export const GET = getHealthStatus

export const dynamic = "force-dynamic"
