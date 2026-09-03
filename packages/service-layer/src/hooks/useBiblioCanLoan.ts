"use client"

import { type UseQueryOptions, type UseQueryResult, useQuery } from "@tanstack/react-query"

import { useServiceLayerConfig } from "../context/ServiceLayerContext"
import type { biblioCanLoanQueryKey } from "../queries/biblio"
import { biblioCanLoanQuery } from "../queries/biblio"
import type { BiblioCanLoan } from "../types"

type BiblioCanLoanQueryKey = ReturnType<typeof biblioCanLoanQueryKey>

type UseBiblioCanLoanOptions = Omit<
  UseQueryOptions<BiblioCanLoan | null, Error, BiblioCanLoan | null, BiblioCanLoanQueryKey>,
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
export const useBiblioCanLoan = (
  materialId: string | null,
  options?: UseBiblioCanLoanOptions
): UseQueryResult<BiblioCanLoan | null, Error> => {
  const config = useServiceLayerConfig()
  const { enabled = true, allowNotFound, ...restOptions } = options ?? {}
  return useQuery({
    ...biblioCanLoanQuery(config, materialId, { allowNotFound }),
    ...restOptions,
    enabled: config.isPatronAuthenticated && enabled && Boolean(materialId),
  })
}
