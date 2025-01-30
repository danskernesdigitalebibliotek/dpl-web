import { QueryClient } from "@tanstack/react-query"
import { cache } from "react"

import { getQueryClientStaleTime } from "./helpers/graphql"

const getQueryClient = cache(
  () =>
    new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: getQueryClientStaleTime(),
        },
      },
    })
)
export default getQueryClient
