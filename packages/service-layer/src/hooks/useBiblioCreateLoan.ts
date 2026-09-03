"use client"

import { type UseMutationOptions, type UseMutationResult, useMutation } from "@tanstack/react-query"

import { createBiblioLoan } from "../biblio"
import { useServiceLayerConfig } from "../context/ServiceLayerContext"
import type { BiblioLoanResult } from "../types"

type UseBiblioCreateLoanOptions = Omit<
  UseMutationOptions<BiblioLoanResult, Error, string>,
  "mutationFn"
>

/**
 * Create a digital loan through the Biblio adapter.
 *
 * The adapter can accept the request without creating a loan - an exceeded
 * quota, say - so callers must check `result.loan` rather than treat a
 * resolved promise as success.
 *
 * Callers gate on the feature flag: new loans belong to Biblio only once the
 * library has switched to it.
 */
export const useBiblioCreateLoan = (
  options?: UseBiblioCreateLoanOptions
): UseMutationResult<BiblioLoanResult, Error, string> => {
  const config = useServiceLayerConfig()
  return useMutation({
    mutationFn: materialId => createBiblioLoan(config, materialId),
    ...options,
  })
}
