import AccessForbiddenError from "./AccessForbiddenError"

const getHeaders = (headers: RequestInit["headers"] | undefined) => {
  const contentTypeHeader = {
    "Content-Type": "application/json",
  }

  if (headers && headers.hasOwnProperty("Cookie")) {
    return { ...contentTypeHeader, ...headers }
  }
  const dplCmsGraphqlBasicToken = process.env.NEXT_PUBLIC_GRAPHQL_BASIC_TOKEN_DPL_CMS

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
  const dplCmsGraphqlEndpoint = process.env.NEXT_PUBLIC_GRAPHQL_SCHEMA_ENDPOINT_DPL_CMS
  const dplCmsGraphqlBasicToken = process.env.NEXT_PUBLIC_GRAPHQL_BASIC_TOKEN_DPL_CMS

  // Check if the environment variables are set
  if (!dplCmsGraphqlEndpoint) {
    throw new Error("Missing DPL CMS GraphQL endpoint")
  }
  if (!dplCmsGraphqlBasicToken) {
    throw new Error("Missing DPL CMS GraphQL basic token")
  }
  const { next, headers } = options || {}

  return async (): Promise<TData> => {
    const res = await fetch(dplCmsGraphqlEndpoint, {
      method: "POST",
      headers: getHeaders(headers),
      body: JSON.stringify({ query, variables }),
      next,
    })

    // TODO: Remove console logs when we are more confident
    // in dpl-cms fetching and caching of data.
    // eslint-disable-next-line no-console
    // console.log({ body: JSON.stringify({ query, variables }) })

    const json = await res.json()

    // TODO: Remove console logs when we are more confident
    // in dpl-cms fetching and caching of data.
    // eslint-disable-next-line no-console
    // console.log({ goConfiguration: json?.data?.goConfiguration })
    // TODO: Remove console logs when we are more confident
    // in dpl-cms fetching and caching of data.
    // eslint-disable-next-line no-console
    // console.log({ adgangsplatformenTokens: json?.data?.dplTokens?.adgangsplatformen })

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
