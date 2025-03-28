import { getEnv } from "@/lib/config/env"

import AccessForbiddenError from "./AccessForbiddenError"

const getHeaders = (headers: RequestInit["headers"] | undefined) => {
  const contentTypeHeader = {
    "Content-Type": "application/json",
  }

  if (headers && headers.hasOwnProperty("Cookie")) {
    return { ...contentTypeHeader, ...headers }
  }
  const dplCmsGraphqlBasicToken = getEnv("GRAPHQL_BASIC_TOKEN_DPL_CMS")

  return {
    ...contentTypeHeader,
    Authorization: `Basic ${dplCmsGraphqlBasicToken}`,
    ...headers,
  }
}

export function fetcher<TData, TVariables>(
  query: string,
  variables?: TVariables,
  options?: RequestInit & { next?: NextFetchRequestConfig }
) {
  // console.log("DPL CMS FETCHING")
  const dplCmsGraphqlEndpoint = getEnv("GRAPHQL_SCHEMA_ENDPOINT_DPL_CMS")
  const dplCmsGraphqlBasicToken = getEnv("GRAPHQL_BASIC_TOKEN_DPL_CMS")

  // Check if the environment variables are set
  if (!dplCmsGraphqlEndpoint) {
    throw new Error("Missing DPL CMS GraphQL endpoint")
  }
  if (!dplCmsGraphqlBasicToken) {
    throw new Error("Missing DPL CMS GraphQL basic token")
  }
  const { next, headers } = options || {}

  // console.log("GET HEADERS IN DPL CMS FETCHER", getHeaders(headers))
  return async (): Promise<TData> => {
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

    return json.data
  }
}
