import { getAPServiceFetcherBaseUrl } from "@/lib/helpers/ap-service"

export const fetchData = <TData, TVariables>(
  query: string,
  variables?: TVariables,
  options?: RequestInit["headers"]
): (() => Promise<TData>) => {
  return async () => {
    const url = getAPServiceFetcherBaseUrl("fbi")
    try {
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
        console.error("FBI GraphQL errors:", json.errors)
        throw new Error("FBI GraphQL errors occurred")
      }

      return json.data
    } catch (error) {
      console.error("Failed to fetch data from FBI", error)
      throw new Error("Failed to fetch data from FBI")
    }
  }
}
