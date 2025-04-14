import { getAPServiceFetcherAuthheader, getAPServiceFetcherBaseUrl } from "@/lib/helpers/ap-service"

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
  const authHeader = await getAPServiceFetcherAuthheader("covers")
  const headers = data?.headers === "object" ? (data?.headers as unknown as object) : {}
  const baseUrl = getAPServiceFetcherBaseUrl("covers")
  const body = data ? JSON.stringify(data) : null
  const serviceUrl = getRestServiceUrlWithParams({
    baseUrl,
    url,
    params,
  })

  try {
    const response = await fetch(serviceUrl, {
      method,
      headers: {
        ...(authHeader ? { authorization: authHeader } : {}),
        ...headers,
      },
      body,
    })

    if (!response.ok) {
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
