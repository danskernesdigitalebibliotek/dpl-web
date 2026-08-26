"use client"

import { type UseQueryOptions, type UseQueryResult, useQuery } from "@tanstack/react-query"

import { useServiceLayerConfig } from "../context/ServiceLayerContext"
import type { digitalLoansQueryKey } from "../queries/biblio"
import { digitalLoansQuery } from "../queries/biblio"
import type { DigitalLoan } from "../types"

type DigitalLoansPage = { loans: DigitalLoan[]; nextCursor?: string }

type DigitalLoansQueryKey = ReturnType<typeof digitalLoansQueryKey>

type UseBiblioLoansOptions = Omit<
  UseQueryOptions<DigitalLoansPage, Error, DigitalLoansPage, DigitalLoansQueryKey>,
  "queryKey" | "queryFn" | "enabled"
> & { enabled?: boolean }

export const useDigitalLoans = (
  options?: UseBiblioLoansOptions
): UseQueryResult<DigitalLoansPage, Error> => {
  const config = useServiceLayerConfig()
  const { enabled = true, ...restOptions } = options ?? {}
  return useQuery({
    ...digitalLoansQuery(config),
    ...restOptions,
    // Patron-scoped: never fires without a patron session, regardless of the
    // consumer's own `enabled` condition.
    enabled: (config.isPatronAuthenticated ?? true) && enabled,
  })
}
