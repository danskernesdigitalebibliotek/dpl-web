import { getRestServiceUrlWithParams } from "@/lib/fetchers/helper"
import { getAPServiceFetcherAuthheader, getAPServiceFetcherBaseUrl } from "@/lib/helpers/ap-service"

export const fetcher = async <ResponseType>({
  url,
  method,
  headers,
  params,
  data,
}: {
  url: string
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "HEAD"
  headers?: HeadersInit
  params?: unknown
  data?: BodyType<unknown>
  signal?: AbortSignal
}) => {
  const authHeader = await getAPServiceFetcherAuthheader("fbs")
  const baseUrl = getAPServiceFetcherBaseUrl("fbs")
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
    console.error(message, serviceUrl)
  }

  // Do nothing. Some of the responses are intentionally empty and thus
  // cannot be converted to JSON. Fetch API and TypeScript has no clean
  // way for us to identify empty responses, so instead we swallow
  // syntax errors during decoding.
  return null
}

export default fetcher

export type ErrorType<ErrorData> = ErrorData

export type BodyType<BodyData> = BodyData
