import { QueryClient } from "@tanstack/react-query"
import { cache } from "react"

const getQueryClient = cache(
  () =>
    new QueryClient({
      defaultOptions: {
        queries: {
          // TODO: Move this into config.
          staleTime: 5 * 60 * 1000, // 5 mins
        },
      },
    })
)
export default getQueryClient
