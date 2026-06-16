"use client"

import { type UseQueryOptions, type UseQueryResult, useQuery } from "@tanstack/react-query"

import { useServiceLayerConfig } from "../context/ServiceLayerContext"
import { reservationsQuery } from "../queries/reservations"
import type { reservationsQueryKey } from "../queryKeys"
import type { Reservation } from "../types"

type ReservationsQueryKey = ReturnType<typeof reservationsQueryKey>

type UseReservationsOptions = Omit<
  UseQueryOptions<Reservation[], Error, Reservation[], ReservationsQueryKey>,
  "queryKey" | "queryFn"
>

export const useReservations = (
  options?: UseReservationsOptions
): UseQueryResult<Reservation[], Error> => {
  const config = useServiceLayerConfig()
  return useQuery({
    ...reservationsQuery(config),
    ...options,
  })
}
