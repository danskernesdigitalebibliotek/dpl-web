import { getAPServiceFetcherBaseUrl } from "@/lib/helpers/ap-service"

// Fetcher for interacting with the Publizon adapter.
// Ensure this file remains consistent with the local adapter fetcher logic for uniform response handling.
export const fetcher = async <T>(url: string, init: RequestInit): Promise<T> => {
  const baseUrl = getAPServiceFetcherBaseUrl("pubhub-adapter")
  const serviceUrl = `${baseUrl}${url}`

  try {
    const response = await fetch(serviceUrl, init)

    if (!response.ok) {
      const errorData = await response.json()
      throw Error(JSON.stringify(errorData))
    }

    try {
      return (await response.json()) as T
    } catch (e) {
      if (!(e instanceof SyntaxError)) {
        throw e
      }
    }

    // Some responses are intentionally empty and thus cannot be
    // converted to JSON. We swallow syntax errors during decoding.
    return null as T
  } catch (error: unknown) {
    if (error) {
      throw error
    }

    const message = error instanceof Error ? error.message : "Unknown error"
    console.error(message, serviceUrl)
    throw new Error(message)
  }
}

export default fetcher

export type ErrorType<ErrorData> = ErrorData

export type BodyType<BodyData> = BodyData
