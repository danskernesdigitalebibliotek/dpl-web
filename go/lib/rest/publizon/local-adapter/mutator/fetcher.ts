import { getEnv } from "@/lib/config/env"
import goConfig from "@/lib/config/goConfig"
import { getRestServiceUrlWithParams } from "@/lib/fetchers/helper"

// Fetcher for interacting with the local Publizon adapter.
// Ensure this file remains consistent with the adapter fetcher logic for uniform response handling.
export const fetcher = async <ResponseType>({
  url,
  method,
  headers,
  params,
  data,
}: {
  url: string
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "HEAD"
  headers?: object
  params?: unknown
  data?: BodyType<unknown>
  signal?: AbortSignal
}) => {
  const body = data ? JSON.stringify(data) : null
  const serviceUrl = getRestServiceUrlWithParams({
    baseUrl: `${getEnv("APP_URL")}/${goConfig("routes.pubhub")}`,
    url,
    params,
  })

  try {
    const response = await fetch(serviceUrl, {
      method,
      headers: {
        ...headers,
      },
      body,
    })

    if (!response.ok) {
      const data = await response.json()
      throw Error(JSON.stringify(data))
    }

    try {
      return (await response.json()) as ResponseType
    } catch (e) {
      if (!(e instanceof SyntaxError)) {
        throw e
      }
    }
  } catch (error: unknown) {
    if (error) {
      throw error
    }

    const message = error instanceof Error ? error.message : "Unknown error"
    console.error("publizon fetcher error", message, serviceUrl)
  }

  // Do nothing. Some of our responses are intentionally empty and thus
  // cannot be converted to JSON. Fetch API and TypeScript has no clean
  // way for us to identify empty responses, so instead we swallow
  // syntax errors during decoding.
  return null
}

export default fetcher

export type ErrorType<ErrorData> = ErrorData

export type BodyType<BodyData> = BodyData
