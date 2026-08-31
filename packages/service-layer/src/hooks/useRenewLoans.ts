"use client"

import {
  type UseMutationOptions,
  type UseMutationResult,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query"

import { useServiceLayerConfig } from "../context/ServiceLayerContext"
import { renewLoans } from "../loans"
import { loansQueryKey } from "../queries/loans"
import type { RenewedLoan } from "../types"

type UseRenewLoansOptions = Omit<UseMutationOptions<RenewedLoan[], Error, number[]>, "mutationFn">

export const useRenewLoans = (
  options?: UseRenewLoansOptions
): UseMutationResult<RenewedLoan[], Error, number[]> => {
  const config = useServiceLayerConfig()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: loanIds => renewLoans(config, loanIds),
    onSuccess: (data, variables, onMutateResult, context) => {
      // Denials also come back as a 2xx result list, but dueDate may have
      // changed for any renewed loan — refetch the loan list either way.
      queryClient.invalidateQueries({ queryKey: loansQueryKey() })
      options?.onSuccess?.(data, variables, onMutateResult, context)
    },
    ...options,
  })
}
