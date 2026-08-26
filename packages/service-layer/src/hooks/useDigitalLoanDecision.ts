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
  /**
   * TEMPORARY, with the toleration flag that feeds it: resolve a material
   * the adapter does not know to null instead of an error. Off by default:
   * asking about an unknown material is normally a routing mistake worth
   * hearing about.
   */
  allowNotFound?: boolean
}

/**
 * Whether the user can borrow a material through the Biblio adapter.
 *
 * Patron-scoped: the operation is canLoanForAuthenticatedUser, and the adapter
 * answers 403 for a library token - which, with errors surfaced, takes the
 * whole page down. The hook therefore refuses to ask without a patron, so a
 * call site cannot forget to guard.
 */
export const useDigitalLoanDecision = (
  materialId: string | null,
  options?: UseDigitalLoanDecisionOptions
): UseQueryResult<LoanDecision | null, Error> => {
  const config = useServiceLayerConfig()
  const { enabled = true, allowNotFound, ...restOptions } = options ?? {}
  return useQuery({
    ...digitalLoanDecisionQuery(config, materialId, { allowNotFound }),
    ...restOptions,
    enabled: config.isPatronAuthenticated && enabled && Boolean(materialId),
  })
}
