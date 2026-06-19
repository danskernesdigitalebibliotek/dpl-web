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
import { createReservation } from "../reservation"
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
      // FBS returns CreateReservationResult with `status: "success" | "failed"`.
      // A `failed` result is still a resolved Promise — only bust caches on a
      // real server-side change.
      if (data.status === "success") {
        queryClient.invalidateQueries({ queryKey: reservationsQueryKey() })
        queryClient.invalidateQueries({ queryKey: materialAvailabilityQueryKey() })
      }
      options?.onSuccess?.(data, variables, onMutateResult, context)
    },
    ...options,
  })
}
