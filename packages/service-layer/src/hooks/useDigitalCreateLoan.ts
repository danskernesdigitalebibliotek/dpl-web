"use client"

import { type UseMutationOptions, type UseMutationResult, useMutation } from "@tanstack/react-query"

import { createDigitalLoan } from "../biblio"
import { useServiceLayerConfig } from "../context/ServiceLayerContext"
import type { LoanRequestResult } from "../types"

type UseDigitalCreateLoanOptions = Omit<
  UseMutationOptions<LoanRequestResult, Error, string>,
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
export const useDigitalCreateLoan = (
  options?: UseDigitalCreateLoanOptions
): UseMutationResult<LoanRequestResult, Error, string> => {
  const config = useServiceLayerConfig()
  return useMutation({
    mutationFn: materialId => createDigitalLoan(config, materialId),
    ...options,
  })
}
