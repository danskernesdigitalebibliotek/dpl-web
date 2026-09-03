"use client"

import { type UseMutationOptions, type UseMutationResult, useMutation } from "@tanstack/react-query"

import { deleteBiblioReservation } from "../biblio"
import { useServiceLayerConfig } from "../context/ServiceLayerContext"

type UseBiblioDeleteReservationOptions = Omit<
  UseMutationOptions<boolean, Error, string>,
  "mutationFn"
>

/**
 * Cancel a reservation in the Biblio adapter, by the reservation's own id -
 * Publizon cancels by material identifier.
 *
 * A request the adapter accepted without removing anything rejects rather than
 * resolves; see deleteBiblioReservation for why.
 */
export const useBiblioDeleteReservation = (
  options?: UseBiblioDeleteReservationOptions
): UseMutationResult<boolean, Error, string> => {
  const config = useServiceLayerConfig()
  return useMutation({
    mutationFn: reservationId => deleteBiblioReservation(config, reservationId),
    ...options,
  })
}
