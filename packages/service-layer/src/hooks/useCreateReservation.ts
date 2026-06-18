"use client"

import {
  type UseMutationOptions,
  type UseMutationResult,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query"

import { useServiceLayerConfig } from "../context/ServiceLayerContext"
import { createReservation } from "../reservation"
import { reservationsQueryKey } from "../queryKeys"
import type { CreateReservationInput, CreateReservationResult } from "../types"

type UseCreateReservationOptions = Omit<
  UseMutationOptions<CreateReservationResult, Error, CreateReservationInput>,
  "mutationFn"
>

export const useCreateReservation = (
  options?: UseCreateReservationOptions
): UseMutationResult<CreateReservationResult, Error, CreateReservationInput> => {
  const config = useServiceLayerConfig()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: input => createReservation(config, input),
    onSuccess: (data, variables, onMutateResult, context) => {
      // Bust reservations + availability so consumers re-fetch fresh state.
      // Prefix match invalidates every materialAvailability key regardless of workId.
      queryClient.invalidateQueries({ queryKey: reservationsQueryKey() })
      queryClient.invalidateQueries({ queryKey: ["serviceLayer", "materialAvailability"] })
      options?.onSuccess?.(data, variables, onMutateResult, context)
    },
    ...options,
  })
}
