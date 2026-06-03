"use client"

import { type UseQueryOptions, type UseQueryResult, useQuery } from "@tanstack/react-query"

import { useServiceLayerConfig } from "../context/ServiceLayerContext"
import { patronQuery } from "../queries/patron"
import type { patronQueryKey } from "../queryKeys"
import type { Patron } from "../types"

type PatronQueryKey = ReturnType<typeof patronQueryKey>

type UsePatronOptions = Omit<
  UseQueryOptions<Patron | undefined, Error, Patron | undefined, PatronQueryKey>,
  "queryKey" | "queryFn"
>

export const usePatron = (
  options?: UsePatronOptions
): UseQueryResult<Patron | undefined, Error> => {
  const config = useServiceLayerConfig()
  return useQuery({
    ...patronQuery(config),
    ...options,
  })
}
