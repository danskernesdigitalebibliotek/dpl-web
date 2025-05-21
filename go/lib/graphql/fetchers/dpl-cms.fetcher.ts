import { getEnv } from "@/lib/config/env"
import goConfig from "@/lib/config/goConfig"

import AccessForbiddenError from "./AccessForbiddenError"

const getHeaders = (headers: RequestInit["headers"] | undefined) => {
  const contentTypeHeader = {
    "Content-Type": "application/json",
  }

  if (headers && headers.hasOwnProperty("Cookie")) {
    return { ...contentTypeHeader, ...headers }
  }
  const basicToken = Buffer.from(
    `${getEnv("GO_GRAPHQL_CONSUMER_USER_NAME")}:${getEnv("GO_GRAPHQL_CONSUMER_USER_PASSWORD")}`
  ).toString("base64")

  return {
    ...contentTypeHeader,
    Authorization: `Basic ${basicToken}`,
    ...headers,
  }
}

export function fetcher<TData, TVariables>(
  query: string,
  variables?: TVariables,
  options?: RequestInit & { next?: NextFetchRequestConfig }
) {
  const { next, headers } = options || {}
  const dplCmsGraphqlEndpoint = getEnv("GRAPHQL_SCHEMA_ENDPOINT_DPL_CMS")

  return async (): Promise<TData> => {
    try {
      const res = await fetch(dplCmsGraphqlEndpoint, {
        method: "POST",
        headers: getHeaders(headers),
        body: JSON.stringify({ query, variables }),
        next,
      })

      const json = await res.json()

      if (res.status !== 200) {
        const { message } = json
        if (res.status === 403) {
          throw new AccessForbiddenError(message)
        } else {
          throw new Error(message)
        }
      }

      const cacheTagsRaw = res.headers.get(goConfig("caching.dpl-cms.cachetags-header"))
      return { ...json.data, go: { cacheTags: cacheTagsRaw ? cacheTagsRaw.split(" ") : null } }
    } catch (error) {
      console.log("Error in fetcher", error)
      throw new Error("Failed to fetch data from DPL CMS", { cause: error })
    }
  }
}
