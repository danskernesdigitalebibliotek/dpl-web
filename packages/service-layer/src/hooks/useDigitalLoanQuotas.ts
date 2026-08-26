"use client"

import { type UseQueryOptions, type UseQueryResult, useQuery } from "@tanstack/react-query"

import { useServiceLayerConfig } from "../context/ServiceLayerContext"
import type { digitalLoanQuotasQueryKey } from "../queries/biblio"
import { digitalLoanQuotasQuery } from "../queries/biblio"
import type { DigitalLoanQuota } from "../types"

type DigitalLoanQuotasQueryKey = ReturnType<typeof digitalLoanQuotasQueryKey>

type UseBiblioLoanQuotasOptions = Omit<
  UseQueryOptions<DigitalLoanQuota[], Error, DigitalLoanQuota[], DigitalLoanQuotasQueryKey>,
  "queryKey" | "queryFn" | "enabled"
> & { enabled?: boolean }

export const useDigitalLoanQuotas = (
  options?: UseBiblioLoanQuotasOptions
): UseQueryResult<DigitalLoanQuota[], Error> => {
  const config = useServiceLayerConfig()
  const { enabled = true, ...restOptions } = options ?? {}
  return useQuery({
    ...digitalLoanQuotasQuery(config),
    ...restOptions,
    // Patron-scoped: never fires without a patron session, regardless of the
    // consumer's own `enabled` condition.
    enabled: config.isPatronAuthenticated && enabled,
  })
}
