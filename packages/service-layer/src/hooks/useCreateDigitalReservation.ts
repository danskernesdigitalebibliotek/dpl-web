"use client"

import { type UseMutationOptions, type UseMutationResult, useMutation } from "@tanstack/react-query"

import { createDigitalReservation } from "../biblio"
import { useServiceLayerConfig } from "../context/ServiceLayerContext"
import type { LoanRequestResult } from "../types"

type UseBiblioCreateReservationOptions = Omit<
  UseMutationOptions<LoanRequestResult, Error, string>,
  "mutationFn"
>

/**
 * Reserve a material through the Biblio adapter.
 *
 * Answers with the same envelope as a loan request: a decision status, and a
 * loan when the material turned out to be available right away.
 */
export const useCreateDigitalReservation = (
  options?: UseBiblioCreateReservationOptions
): UseMutationResult<LoanRequestResult, Error, string> => {
  const config = useServiceLayerConfig()
  return useMutation({
    mutationFn: materialId => createDigitalReservation(config, materialId),
    ...options,
  })
}
