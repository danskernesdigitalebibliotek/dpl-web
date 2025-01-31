import goConfig from "@/lib/config/goConfig"

import { getRestServiceUrlWithParams } from "../../../fetchers/helper"

export const fetcher = async <ResponseType>({
  url,
  method,
  params,
  data,
}: {
  url: string
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "HEAD"
  params?: unknown
  data?: BodyType<unknown>
  signal?: AbortSignal
}) => {
  const additionalHeaders = data?.headers === "object" ? (data?.headers as unknown as object) : {}
  const authHeaders = {
    Authorization: `Bearer ${goConfig("token.adgangsplatformen.library")}`,
  } as object

  const headers = {
    ...authHeaders,
    ...additionalHeaders,
  }

  const body = data ? JSON.stringify(data) : null
  const serviceUrl = getRestServiceUrlWithParams({
    baseUrl: "https://cover.dandigbib.org",
    url,
    params,
  })

  try {
    const response = await fetch(serviceUrl, {
      method,
      headers,
      body,
    })

    if (!response.ok) {
      // eslint-disable-next-line no-console
      console.error(response.status, response.statusText, serviceUrl)
    }

    // Return the response body in JSON format if the method is GET.
    if (method === "GET") {
      try {
        return (await response.json()) as ResponseType
      } catch (error) {
        throw new Error(`The response body contains invalid JSON: ${error}`)
      }
    }
  } catch (error) {
    if (error) {
      throw error
    }

    const message = error instanceof Error ? error.message : "Unknown error"
    // eslint-disable-next-line no-console
    console.error(message, serviceUrl)
  }

  // Do nothing. Some of our responses are intentionally empty and thus
  // cannot be converted to JSON. Fetch API and TypeScript has no clean
  // way for us to identify empty responses so instead we swallow
  // syntax errors during decoding.
  return null
}

export default fetcher

export type ErrorType<ErrorData> = ErrorData & { status: number }

export type BodyType<BodyData> = BodyData & { headers?: unknown }
