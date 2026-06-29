"use client"

import {
  type UseMutationOptions,
  type UseMutationResult,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query"

import { useServiceLayerConfig } from "../context/ServiceLayerContext"
import { materialAvailabilityQueryKey } from "../queries/availability"
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
      queryClient.invalidateQueries({ queryKey: materialAvailabilityQueryKey() })
      options?.onSuccess?.(data, variables, onMutateResult, context)
    },
    ...options,
  })
}
