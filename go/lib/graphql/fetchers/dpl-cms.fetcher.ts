import { getDplCmsGraphqlEndpoint } from "@/lib/helpers/dpl-cms.graphql"

export function fetcher<TData, TVariables>(
  query: string,
  variables?: TVariables,
  options?: RequestInit["headers"]
) {
  const dplCmsGraphqlEndpoint = getDplCmsGraphqlEndpoint()
  const dplCmsGraphqlBasicToken = process.env.NEXT_PUBLIC_GRAPHQL_BASIC_TOKEN_DPL_CMS

  if (!dplCmsGraphqlEndpoint || !dplCmsGraphqlBasicToken) {
    throw new Error("Missing DPL CMS GraphQL endpoint or basic token")
  }

  return async (): Promise<TData> => {
    const res = await fetch(dplCmsGraphqlEndpoint, {
      method: "POST",
      ...{
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${dplCmsGraphqlBasicToken}`,
          ...options,
        },
      },
      body: JSON.stringify({ query, variables }),
    })

    const json = await res.json()

    if (json.errors) {
      const { message } = json.errors[0]

      throw new Error(message)
    }

    return json.data
  }
}
