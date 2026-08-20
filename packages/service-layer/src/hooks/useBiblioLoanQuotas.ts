"use client"

import { type UseQueryOptions, type UseQueryResult, useQuery } from "@tanstack/react-query"

import { useServiceLayerConfig } from "../context/ServiceLayerContext"
import type { biblioLoanQuotasQueryKey } from "../queries/biblio"
import { biblioLoanQuotasQuery } from "../queries/biblio"
import type { BiblioLoanQuota } from "../types"

type BiblioLoanQuotasQueryKey = ReturnType<typeof biblioLoanQuotasQueryKey>

type UseBiblioLoanQuotasOptions = Omit<
  UseQueryOptions<BiblioLoanQuota[], Error, BiblioLoanQuota[], BiblioLoanQuotasQueryKey>,
  "queryKey" | "queryFn" | "enabled"
> & { enabled?: boolean }

export const useBiblioLoanQuotas = (
  options?: UseBiblioLoanQuotasOptions
): UseQueryResult<BiblioLoanQuota[], Error> => {
  const config = useServiceLayerConfig()
  const { enabled = true, ...restOptions } = options ?? {}
  return useQuery({
    ...biblioLoanQuotasQuery(config),
    ...restOptions,
    // Patron-scoped: never fires without a patron session, regardless of the
    // consumer's own `enabled` condition.
    enabled: config.isPatronAuthenticated && enabled,
  })
}
