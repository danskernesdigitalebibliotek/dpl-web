import getConfig from "@/lib/config/config"

export const fetchData = <TData, TVariables>(
  query: string,
  variables?: TVariables,
  options?: RequestInit["headers"]
): (() => Promise<TData>) => {
  return async () => {
    const res = await fetch(`${getConfig("service.fbi.graphql.endpoint")}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getConfig("token.adgangsplatformen.library")}`,
        ...options,
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    })

    const json = await res.json()

    if (json.errors) {
      const { message } = json.errors[0] || {}
      throw new Error(message || "Error…")
    }

    return json.data
  }
}
