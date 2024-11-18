export function fetcher<TData, TVariables>(query: string, variables?: TVariables) {
  return async (): Promise<TData> => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_GRAPHQL_SCHEMA_ENDPOINT_DPL_CMS}`, {
      method: "POST",
      ...{
        headers: {
          "Content-Type": "application/json",
          Authorization: "Basic " + process.env.GRAPHQL_SCHEMA_ENDPOINT_DPL_CMS_AUTH_HEADER,
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
