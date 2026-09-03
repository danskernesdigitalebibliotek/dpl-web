import { queryOptions } from "@tanstack/react-query"

import { getReaderSignInToken } from "../reader"
import type { ServiceLayerConfig } from "../types"
import { serviceLayerNamespace } from "./namespace"

export const readerSignInTokenQueryKey = () => [serviceLayerNamespace, "readerSignInToken"] as const

export const readerSignInTokenQuery = (config: ServiceLayerConfig) =>
  queryOptions({
    queryKey: readerSignInTokenQueryKey(),
    queryFn: () => getReaderSignInToken(config),
    // The token expires, so it must not outlive its own window in the cache.
    // Refetching a minute early leaves room for the sign-in round trip that
    // follows, and the adapter is happy to mint another.
    staleTime: query => Math.max(0, ((query.state.data?.expiresInSeconds ?? 60) - 60) * 1000),
  })
