"use client"

import type { UseQueryResult } from "@tanstack/react-query"

import { digitalReservationsQuery, type digitalReservationsQueryKey } from "../queries/biblio"
import type { DigitalReservation } from "../types"
import { type DigitalQueryOptions, useDigitalQuery } from "./internal"

type DigitalReservationsPage = { reservations: DigitalReservation[]; nextCursor?: string }

export const useDigitalReservations = (
  options?: DigitalQueryOptions<
    DigitalReservationsPage,
    ReturnType<typeof digitalReservationsQueryKey>
  >
): UseQueryResult<DigitalReservationsPage, Error> =>
  useDigitalQuery({ query: digitalReservationsQuery, options })
