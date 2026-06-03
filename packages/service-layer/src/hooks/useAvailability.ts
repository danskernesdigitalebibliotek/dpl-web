"use client"

import { type UseQueryOptions, type UseQueryResult, useQuery } from "@tanstack/react-query"

import { getAvailability } from "../availability"
import { useServiceLayerConfig } from "../provider/ServiceLayerProvider"
import type { Availability } from "../types"

export type UseAvailabilityParams = {
  faustIds: string[]
  excludeBranches?: string[]
}

export type UseAvailabilityOptions = Omit<
  UseQueryOptions<Availability[], Error>,
  "queryKey" | "queryFn"
>

export const availabilityQueryKey = (faustIds: string[], excludeBranches: string[] = []) =>
  [
    "service-layer",
    "fbs",
    "availability",
    { faustIds: [...faustIds].sort(), excludeBranches: [...excludeBranches].sort() },
  ] as const

export function useAvailability(
  { faustIds, excludeBranches = [] }: UseAvailabilityParams,
  options?: UseAvailabilityOptions
): UseQueryResult<Availability[], Error> {
  const { fbs } = useServiceLayerConfig()

  return useQuery<Availability[], Error>({
    queryKey: availabilityQueryKey(faustIds, excludeBranches),
    queryFn: () => getAvailability({ fbs, faustIds, excludeBranches }),
    ...options,
  })
}
