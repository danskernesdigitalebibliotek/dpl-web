"use client"

import { type UseQueryOptions, type UseQueryResult, useQuery } from "@tanstack/react-query"

import { useServiceLayerConfig } from "../context/ServiceLayerContext"
import type { biblioReservationsQueryKey } from "../queries/biblio"
import { biblioReservationsQuery } from "../queries/biblio"
import type { BiblioReservation } from "../types"

type BiblioReservationsPage = { reservations: BiblioReservation[]; nextCursor?: string }

type BiblioReservationsQueryKey = ReturnType<typeof biblioReservationsQueryKey>

type UseBiblioReservationsOptions = Omit<
  UseQueryOptions<
    BiblioReservationsPage,
    Error,
    BiblioReservationsPage,
    BiblioReservationsQueryKey
  >,
  "queryKey" | "queryFn" | "enabled"
> & { enabled?: boolean }

export const useBiblioReservations = (
  options?: UseBiblioReservationsOptions
): UseQueryResult<BiblioReservationsPage, Error> => {
  const config = useServiceLayerConfig()
  const { enabled = true, ...restOptions } = options ?? {}
  return useQuery({
    ...biblioReservationsQuery(config),
    ...restOptions,
    // Patron-scoped: never fires without a patron session, regardless of the
    // consumer's own `enabled` condition.
    enabled: config.isPatronAuthenticated && enabled,
  })
}
