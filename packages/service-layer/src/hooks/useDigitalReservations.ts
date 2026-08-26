"use client"

import { type UseQueryOptions, type UseQueryResult, useQuery } from "@tanstack/react-query"

import { useServiceLayerConfig } from "../context/ServiceLayerContext"
import type { digitalReservationsQueryKey } from "../queries/biblio"
import { digitalReservationsQuery } from "../queries/biblio"
import type { DigitalReservation } from "../types"

type DigitalReservationsPage = { reservations: DigitalReservation[]; nextCursor?: string }

type DigitalReservationsQueryKey = ReturnType<typeof digitalReservationsQueryKey>

type UseBiblioReservationsOptions = Omit<
  UseQueryOptions<
    DigitalReservationsPage,
    Error,
    DigitalReservationsPage,
    DigitalReservationsQueryKey
  >,
  "queryKey" | "queryFn" | "enabled"
> & { enabled?: boolean }

export const useDigitalReservations = (
  options?: UseBiblioReservationsOptions
): UseQueryResult<DigitalReservationsPage, Error> => {
  const config = useServiceLayerConfig()
  const { enabled = true, ...restOptions } = options ?? {}
  return useQuery({
    ...digitalReservationsQuery(config),
    ...restOptions,
    // Patron-scoped: never fires without a patron session, regardless of the
    // consumer's own `enabled` condition.
    enabled: config.isPatronAuthenticated && enabled,
  })
}
