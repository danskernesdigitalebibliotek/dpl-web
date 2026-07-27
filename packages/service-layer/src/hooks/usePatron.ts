"use client"

import { type UseQueryOptions, type UseQueryResult, useQuery } from "@tanstack/react-query"

import { useServiceLayerConfig } from "../context/ServiceLayerContext"
import { patronQuery } from "../queries/patron"
import type { patronQueryKey } from "../queries/patron"
import type { Patron } from "../types"

type PatronQueryKey = ReturnType<typeof patronQueryKey>

type UsePatronOptions = Omit<
  UseQueryOptions<Patron | undefined, Error, Patron | undefined, PatronQueryKey>,
  "queryKey" | "queryFn" | "enabled"
> & { enabled?: boolean }

export const usePatron = (
  options?: UsePatronOptions
): UseQueryResult<Patron | undefined, Error> => {
  const config = useServiceLayerConfig()
  const { enabled = true, ...restOptions } = options ?? {}
  return useQuery({
    ...patronQuery(config),
    ...restOptions,
    // Patron-scoped: never fires without a patron session, regardless of the
    // consumer's own `enabled` condition.
    enabled: (config.isPatronAuthenticated ?? true) && enabled,
  })
}
