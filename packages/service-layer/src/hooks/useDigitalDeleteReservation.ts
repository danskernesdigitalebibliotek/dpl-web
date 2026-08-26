"use client"

import { type UseMutationOptions, type UseMutationResult, useMutation } from "@tanstack/react-query"

import { deleteDigitalReservation } from "../biblio"
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
 * resolves; see deleteDigitalReservation for why.
 */
export const useDigitalDeleteReservation = (
  options?: UseBiblioDeleteReservationOptions
): UseMutationResult<boolean, Error, string> => {
  const config = useServiceLayerConfig()
  return useMutation({
    mutationFn: reservationId => deleteDigitalReservation(config, reservationId),
    ...options,
  })
}
