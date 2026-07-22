"use client"

import { type UseQueryOptions, type UseQueryResult, useQuery } from "@tanstack/react-query"

import { useServiceLayerConfig } from "../context/ServiceLayerContext"
import { feesQuery } from "../queries/fees"
import type { feesQueryKey } from "../queries/fees"
import type { Fee } from "../types"

type FeesQueryKey = ReturnType<typeof feesQueryKey>

type UseFeesOptions = Omit<
  UseQueryOptions<Fee[], Error, Fee[], FeesQueryKey>,
  "queryKey" | "queryFn" | "enabled"
> & { enabled?: boolean }

export const useFees = (options?: UseFeesOptions): UseQueryResult<Fee[], Error> => {
  const config = useServiceLayerConfig()
  const { enabled = true, ...restOptions } = options ?? {}
  return useQuery({
    ...feesQuery(config),
    ...restOptions,
    // Patron-scoped: never fires without a patron session, regardless of the
    // consumer's own `enabled` condition.
    enabled: (config.isPatronAuthenticated ?? true) && enabled,
  })
}
