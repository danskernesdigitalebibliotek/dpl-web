import { getAPServiceFetcherBaseUrl } from "@/lib/helpers/ap-service"

// Fetcher for interacting with the Publizon adapter.
// Ensure this file remains consistent with the local adapter fetcher logic for uniform response handling.
export const fetcher = async <ResponseType>(url: string, init?: RequestInit) => {
  const baseUrl = getAPServiceFetcherBaseUrl("pubhub-adapter")
  const serviceUrl = `${baseUrl}${url}`

  try {
    const response = await fetch(serviceUrl, init)

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
    console.error(message, serviceUrl)
  }

  // Do nothing. Some of our responses are intentionally empty and thus
  // cannot be converted to JSON. Fetch API and TypeScript has no clean
  // way for us to identify empty responses, so instead we swallow
  // syntax errors during decoding.
  return null as ResponseType
}

export default fetcher

export type ErrorType<ErrorData> = ErrorData

export type BodyType<BodyData> = BodyData
