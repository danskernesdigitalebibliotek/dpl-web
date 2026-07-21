"use client"

import { type UseQueryOptions, type UseQueryResult, useQuery } from "@tanstack/react-query"

import { useServiceLayerConfig } from "../context/ServiceLayerContext"
import { feesQuery } from "../queries/fees"
import type { feesQueryKey } from "../queries/fees"
import type { Fee } from "../types"

type FeesQueryKey = ReturnType<typeof feesQueryKey>

type UseFeesOptions = Omit<
  UseQueryOptions<Fee[], Error, Fee[], FeesQueryKey>,
  "queryKey" | "queryFn"
>

export const useFees = (options?: UseFeesOptions): UseQueryResult<Fee[], Error> => {
  const config = useServiceLayerConfig()
  return useQuery({
    ...feesQuery(config),
    ...options,
  })
}
