"use client"

import { type UseQueryOptions, type UseQueryResult, useQuery } from "@tanstack/react-query"

import { useServiceLayerConfig } from "../context/ServiceLayerContext"
import type { biblioSupportIdQueryKey } from "../queries/biblio"
import { biblioSupportIdQuery } from "../queries/biblio"

type BiblioSupportIdQueryKey = ReturnType<typeof biblioSupportIdQueryKey>

type UseBiblioSupportIdOptions = Omit<
  UseQueryOptions<string, Error, string, BiblioSupportIdQueryKey>,
  "queryKey" | "queryFn" | "enabled"
> & { enabled?: boolean }

export const useBiblioSupportId = (
  options?: UseBiblioSupportIdOptions
): UseQueryResult<string, Error> => {
  const config = useServiceLayerConfig()
  const { enabled = true, ...restOptions } = options ?? {}
  return useQuery({
    ...biblioSupportIdQuery(config),
    ...restOptions,
    // Patron-scoped: never fires without a patron session, regardless of the
    // consumer's own `enabled` condition.
    enabled: config.isPatronAuthenticated && enabled,
  })
}
