"use client"

import { type UseQueryOptions, type UseQueryResult, useQuery } from "@tanstack/react-query"

import { useServiceLayerConfig } from "../context/ServiceLayerContext"
import type { biblioLoansQueryKey } from "../queries/biblio"
import { biblioLoansQuery } from "../queries/biblio"
import type { BiblioLoan } from "../types"

type BiblioLoansPage = { loans: BiblioLoan[]; nextCursor?: string }

type BiblioLoansQueryKey = ReturnType<typeof biblioLoansQueryKey>

type UseBiblioLoansOptions = Omit<
  UseQueryOptions<BiblioLoansPage, Error, BiblioLoansPage, BiblioLoansQueryKey>,
  "queryKey" | "queryFn" | "enabled"
> & { enabled?: boolean }

export const useBiblioLoans = (
  options?: UseBiblioLoansOptions
): UseQueryResult<BiblioLoansPage, Error> => {
  const config = useServiceLayerConfig()
  const { enabled = true, ...restOptions } = options ?? {}
  return useQuery({
    ...biblioLoansQuery(config),
    ...restOptions,
    // Patron-scoped: never fires without a patron session, regardless of the
    // consumer's own `enabled` condition.
    enabled: (config.isPatronAuthenticated ?? true) && enabled,
  })
}
