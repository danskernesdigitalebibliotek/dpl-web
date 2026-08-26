"use client"

import { type UseQueryOptions, type UseQueryResult, useQuery } from "@tanstack/react-query"

import { useServiceLayerConfig } from "../context/ServiceLayerContext"
import type { supportIdQueryKey } from "../queries/biblio"
import { supportIdQuery } from "../queries/biblio"

type BiblioSupportIdQueryKey = ReturnType<typeof supportIdQueryKey>

type UseBiblioSupportIdOptions = Omit<
  UseQueryOptions<string, Error, string, BiblioSupportIdQueryKey>,
  "queryKey" | "queryFn" | "enabled"
> & { enabled?: boolean }

export const useSupportId = (
  options?: UseBiblioSupportIdOptions
): UseQueryResult<string, Error> => {
  const config = useServiceLayerConfig()
  const { enabled = true, ...restOptions } = options ?? {}
  return useQuery({
    ...supportIdQuery(config),
    ...restOptions,
    // Patron-scoped: never fires without a patron session, regardless of the
    // consumer's own `enabled` condition.
    enabled: config.isPatronAuthenticated && enabled,
  })
}
