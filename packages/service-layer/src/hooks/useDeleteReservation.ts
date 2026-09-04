"use client"

import {
  type UseMutationOptions,
  type UseMutationResult,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query"

import { useServiceLayerConfig } from "../context/ServiceLayerContext"
import { serviceLayerNamespace } from "../queries/namespace"
import { reservationsQueryKey } from "../queries/reservations"
import { deleteReservation } from "../reservations"

type UseDeleteReservationOptions = Omit<UseMutationOptions<void, Error, number>, "mutationFn">

export const useDeleteReservation = (
  options?: UseDeleteReservationOptions
): UseMutationResult<void, Error, number> => {
  const config = useServiceLayerConfig()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: reservationId => deleteReservation(config, reservationId),
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: reservationsQueryKey() })
      // Prefix of materialAvailabilityQueryKey: every work's availability
      // (the deleted reservation's work is unknown here).
      queryClient.invalidateQueries({ queryKey: [serviceLayerNamespace, "materialAvailability"] })
      options?.onSuccess?.(data, variables, onMutateResult, context)
    },
    ...options,
  })
}
