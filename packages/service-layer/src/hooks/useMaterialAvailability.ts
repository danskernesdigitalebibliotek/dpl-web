"use client"

import { useQuery, type UseQueryOptions, type UseQueryResult } from "@tanstack/react-query"

import { useServiceLayerConfig } from "../context/ServiceLayerContext"
import { materialAvailabilityQuery } from "../queries/availability"
import { materialAvailabilityQueryKey } from "../queryKeys"
import type { MaterialAvailability } from "../types"

type MaterialAvailabilityQueryKey = ReturnType<typeof materialAvailabilityQueryKey>

type UseMaterialAvailabilityOptions = Omit<
  UseQueryOptions<MaterialAvailability, Error, MaterialAvailability, MaterialAvailabilityQueryKey>,
  "queryKey" | "queryFn"
>

export const useMaterialAvailability = (
  workId: string,
  recordIds: string[],
  options?: UseMaterialAvailabilityOptions
): UseQueryResult<MaterialAvailability, Error> => {
  const config = useServiceLayerConfig()
  return useQuery({
    ...materialAvailabilityQuery(config, workId, recordIds),
    ...options,
  })
}
