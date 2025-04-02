import { getEnv } from "@/lib/config/env"
import goConfig from "@/lib/config/goConfig"

export const fetchData = <TData, TVariables>(
  query: string,
  variables?: TVariables,
  options?: RequestInit["headers"]
): (() => Promise<TData>) => {
  return async () => {
    const res = await fetch(
      `${getEnv("APP_URL")}/${goConfig("routes.adgangsplatformen-service-proxy")}/fbi`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...options,
        },
        body: JSON.stringify({
          query,
          variables,
        }),
      }
    )
    const json = await res.json()

    if (json.errors) {
      const { message } = json.errors[0] || {}
      throw new Error(message || "Error…")
    }

    return json.data
  }
}
