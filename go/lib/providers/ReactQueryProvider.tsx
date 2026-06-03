"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { useState } from "react"

import { getQueryClientStaleTime } from "../helpers/graphql"
import ServiceLayerProviderClient from "./ServiceLayerProviderClient"

function ReactQueryProvider({ children }: React.PropsWithChildren) {
  const [client] = useState(
    new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: getQueryClientStaleTime(),
        },
      },
    })
  )

  return (
    <QueryClientProvider client={client}>
      <ServiceLayerProviderClient>{children}</ServiceLayerProviderClient>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

export default ReactQueryProvider
