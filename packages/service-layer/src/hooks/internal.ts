"use client"

import {
  type QueryKey,
  type UseMutationOptions,
  type UseMutationResult,
  type UseQueryOptions,
  type UseQueryResult,
  useMutation,
  useQuery,
} from "@tanstack/react-query"

import { useServiceLayerConfig } from "../context/ServiceLayerContext"
import type { ServiceLayerConfig } from "../types"

export type DigitalQueryOptions<TData, TKey extends QueryKey> = Omit<
  UseQueryOptions<TData, Error, TData, TKey>,
  "queryKey" | "queryFn" | "enabled"
> & { enabled?: boolean }

// Shared mechanics of every digital query hook. Patron-scoped queries never
// fire without a patron session, whatever the consumer's `enabled` says, and
// a query that `requires` an input it lacks stays off the wire.
//
// Each hook keeps its own file on purpose: hooks are where aggregation across
// lending providers would live, so only the shared mechanics belong here.
export const useDigitalQuery = <TData, TKey extends QueryKey>({
  query,
  options,
  patronScoped = true,
  requires = true,
}: {
  query: (config: ServiceLayerConfig) => UseQueryOptions<TData, Error, TData, TKey>
  options?: DigitalQueryOptions<TData, TKey>
  patronScoped?: boolean
  requires?: boolean
}): UseQueryResult<TData, Error> => {
  const config = useServiceLayerConfig()
  const { enabled = true, ...restOptions } = options ?? {}
  return useQuery({
    ...query(config),
    ...restOptions,
    enabled: (!patronScoped || (config.isPatronAuthenticated ?? true)) && enabled && requires,
  })
}

export type DigitalMutationOptions<TResult> = Omit<
  UseMutationOptions<TResult, Error, string>,
  "mutationFn"
>

// The shared shape of every digital mutation hook: the adapter operations all
// take the config plus a single id, so the hooks only differ in which
// operation they bind.
export const useDigitalMutation = <TResult>(
  mutate: (config: ServiceLayerConfig, id: string) => Promise<TResult>,
  options?: DigitalMutationOptions<TResult>
): UseMutationResult<TResult, Error, string> => {
  const config = useServiceLayerConfig()
  return useMutation({
    mutationFn: id => mutate(config, id),
    ...options,
  })
}
