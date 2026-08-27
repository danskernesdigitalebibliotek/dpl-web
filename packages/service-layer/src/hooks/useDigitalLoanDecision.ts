"use client"

import { type UseQueryOptions, type UseQueryResult, useQuery } from "@tanstack/react-query"

import { useServiceLayerConfig } from "../context/ServiceLayerContext"
import type { digitalLoanDecisionQueryKey } from "../queries/biblio"
import { digitalLoanDecisionQuery } from "../queries/biblio"
import type { LoanDecision } from "../types"

type DigitalLoanDecisionQueryKey = ReturnType<typeof digitalLoanDecisionQueryKey>

type UseDigitalLoanDecisionOptions = Omit<
  UseQueryOptions<LoanDecision | null, Error, LoanDecision | null, DigitalLoanDecisionQueryKey>,
  "queryKey" | "queryFn" | "enabled"
> & {
  enabled?: boolean
}

/**
 * Whether the user can borrow a material through the Biblio adapter.
 *
 * Patron-scoped: the operation is canLoanForAuthenticatedUser, and the adapter
 * answers 403 for a library token - which, with errors surfaced, takes the
 * whole page down. The hook therefore refuses to ask without a patron, so a
 * call site cannot forget to guard.
 *
 * A material the adapter does not know resolves to null when the config
 * tolerates unknown materials - see ServiceLayerConfig - so call sites need
 * no per-call opt-in either.
 */
export const useDigitalLoanDecision = (
  materialId: string | null,
  options?: UseDigitalLoanDecisionOptions
): UseQueryResult<LoanDecision | null, Error> => {
  const config = useServiceLayerConfig()
  const { enabled = true, ...restOptions } = options ?? {}
  return useQuery({
    ...digitalLoanDecisionQuery(config, materialId),
    ...restOptions,
    enabled: config.isPatronAuthenticated && enabled && Boolean(materialId),
  })
}
