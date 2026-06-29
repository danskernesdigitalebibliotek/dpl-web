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

// Hook variables = FBS input + workId metadata for scoped cache invalidation.
// workId is stripped before calling the imperative service-layer fn.
type CreateReservationMutationVariables = CreateReservationInput & {
  workId: string
}

type UseCreateReservationOptions = Omit<
  UseMutationOptions<CreateReservationResult, Error, CreateReservationMutationVariables>,
  "mutationFn"
>

export const useCreateReservation = (
  options?: UseCreateReservationOptions
): UseMutationResult<CreateReservationResult, Error, CreateReservationMutationVariables> => {
  const config = useServiceLayerConfig()
  const queryClient = useQueryClient()
  return useMutation({
    // workId is hook metadata for cache scoping (see onSuccess); the FBS call
    // only takes CreateReservationInput.
    mutationFn: ({ recordId, pickupBranchId, expiryDate }) =>
      createReservation(config, { recordId, pickupBranchId, expiryDate }),
    onSuccess: (data, variables, onMutateResult, context) => {
      // FBS returns CreateReservationResult with `status: "success" | "failed"`.
      // A `failed` result is still a resolved Promise — only bust caches on a
      // real server-side change. Scoped to the just-reserved work.
      if (data.status === "success") {
        queryClient.invalidateQueries({ queryKey: reservationsQueryKey() })
        queryClient.invalidateQueries({
          queryKey: materialAvailabilityQueryKey(variables.workId),
        })
      }
      options?.onSuccess?.(data, variables, onMutateResult, context)
    },
    ...options,
  })
}
