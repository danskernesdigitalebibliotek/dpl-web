"use client"

import { type UseMutationOptions, type UseMutationResult, useMutation } from "@tanstack/react-query"

import { createBiblioReservation } from "../biblio"
import { useServiceLayerConfig } from "../context/ServiceLayerContext"
import type { BiblioLoanResult } from "../types"

type UseBiblioCreateReservationOptions = Omit<
  UseMutationOptions<BiblioLoanResult, Error, string>,
  "mutationFn"
>

/**
 * Reserve a material through the Biblio adapter.
 *
 * Answers with the same envelope as a loan request: a decision status, and a
 * loan when the material turned out to be available right away.
 */
export const useBiblioCreateReservation = (
  options?: UseBiblioCreateReservationOptions
): UseMutationResult<BiblioLoanResult, Error, string> => {
  const config = useServiceLayerConfig()
  return useMutation({
    mutationFn: materialId => createBiblioReservation(config, materialId),
    ...options,
  })
}
