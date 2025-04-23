import { getAPServiceFetcherBaseUrl } from "@/lib/helpers/ap-service"

export const fetchData = <TData, TVariables>(
  query: string,
  variables?: TVariables,
  options?: RequestInit["headers"]
): (() => Promise<TData>) => {
  return async () => {
    const url = getAPServiceFetcherBaseUrl("fbi")
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
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
