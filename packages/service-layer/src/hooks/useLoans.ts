"use client"

import { type UseQueryOptions, type UseQueryResult, useQuery } from "@tanstack/react-query"

import { useServiceLayerConfig } from "../context/ServiceLayerContext"
import { loansQuery } from "../queries/loans"
import type { loansQueryKey } from "../queries/loans"
import type { Loan } from "../types"

type LoansQueryKey = ReturnType<typeof loansQueryKey>

type UseLoansOptions = Omit<
  UseQueryOptions<Loan[], Error, Loan[], LoansQueryKey>,
  "queryKey" | "queryFn" | "enabled"
> & { enabled?: boolean }

export const useLoans = (options?: UseLoansOptions): UseQueryResult<Loan[], Error> => {
  const config = useServiceLayerConfig()
  const { enabled = true, ...restOptions } = options ?? {}
  return useQuery({
    ...loansQuery(config),
    // Due dates and renewability change behind our back (renewals from other
    // devices, staff actions). Always refetch on mount unless a consumer
    // explicitly opts out.
    refetchOnMount: "always",
    ...restOptions,
    // Patron-scoped: never fires without a patron session, regardless of the
    // consumer's own `enabled` condition.
    enabled: (config.isPatronAuthenticated ?? true) && enabled,
  })
}
