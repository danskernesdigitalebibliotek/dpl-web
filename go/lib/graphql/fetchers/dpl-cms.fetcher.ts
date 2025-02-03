type TFetcherOptions = (RequestInit | RequestInit["headers"]) & {
  next?: NextFetchRequestConfig
}

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
  options?: TFetcherOptions
) {
  const dplCmsGraphqlEndpoint = process.env.NEXT_PUBLIC_GRAPHQL_SCHEMA_ENDPOINT_DPL_CMS
  const dplCmsGraphqlBasicToken = process.env.NEXT_PUBLIC_GRAPHQL_BASIC_TOKEN_DPL_CMS

  if (!dplCmsGraphqlEndpoint || !dplCmsGraphqlBasicToken) {
    throw new Error("Missing DPL CMS GraphQL endpoint or basic token")
  }
  const { next, ...restOptions } = options || {}
  const headers = restOptions as RequestInit["headers"]

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
    console.log({ body: JSON.stringify({ query, variables }) })

    const json = await res.json()

    // TODO: Remove console logs when we are more confident
    // in dpl-cms fetching and caching of data.
    // eslint-disable-next-line no-console
    console.log({ dplConfiguration: json?.data?.dplConfiguration })
    // TODO: Remove console logs when we are more confident
    // in dpl-cms fetching and caching of data.
    // eslint-disable-next-line no-console
    console.log({ adgangsplatformenTokens: json?.data?.dplTokens?.adgangsplatformen })

    if (res.status !== 200) {
      const { message } = json

      throw new Error(message)
    }

    return json.data
  }
}
