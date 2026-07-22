"use client"

import { type UseQueryOptions, type UseQueryResult, useQuery } from "@tanstack/react-query"

import { useServiceLayerConfig } from "../context/ServiceLayerContext"
import { reservationsQuery } from "../queries/reservations"
import type { reservationsQueryKey } from "../queries/reservations"
import type { Reservation } from "../types"

type ReservationsQueryKey = ReturnType<typeof reservationsQueryKey>

type UseReservationsOptions = Omit<
  UseQueryOptions<Reservation[], Error, Reservation[], ReservationsQueryKey>,
  "queryKey" | "queryFn" | "enabled"
> & { enabled?: boolean }

export const useReservations = (
  options?: UseReservationsOptions
): UseQueryResult<Reservation[], Error> => {
  const config = useServiceLayerConfig()
  const { enabled = true, ...restOptions } = options ?? {}
  return useQuery({
    ...reservationsQuery(config),
    // Reservations gate UI decisions in modals that open on top of cached
    // data (form-vs-receipt, delete confirm). Always refetch on mount unless
    // a consumer explicitly opts out.
    refetchOnMount: "always",
    ...restOptions,
    // Patron-scoped: never fires without a patron session, regardless of the
    // consumer's own `enabled` condition.
    enabled: (config.isPatronAuthenticated ?? true) && enabled,
  })
}
