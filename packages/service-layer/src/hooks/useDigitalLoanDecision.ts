"use client"

import { useEffect } from "react"

import { cannotBeBorrowed } from "../digital-loan-decision"
import {
  digitalLoanDecisionQuery,
  type digitalLoanDecisionQueryKey,
} from "../queries/digital-loan-decision"
import type { LoanDecisionResult } from "../types"
import { type DigitalQueryOptions, useDigitalQuery } from "./internal"

export type DigitalLoanDecisionResult = {
  // Undefined while the question is unanswered.
  data: LoanDecisionResult | undefined
  isLoading: boolean
}

/**
 * Whether the user can borrow a material through the Biblio adapter.
 *
 * Patron-scoped: the adapter answers 403 to a library token, so the hook
 * refuses to ask without a patron.
 *
 * A failure stays off the error boundary - see digitalLoanDecisionQuery - and
 * is answered as a material that cannot be borrowed, so no caller has to
 * read `isError`. It is logged so it is still visible in DevTools.
 */
export const useDigitalLoanDecision = (
  materialId: string | null,
  options?: DigitalQueryOptions<LoanDecisionResult, ReturnType<typeof digitalLoanDecisionQueryKey>>
): DigitalLoanDecisionResult => {
  const { data, error, isLoading } = useDigitalQuery({
    query: config => digitalLoanDecisionQuery(config, materialId),
    options,
    requires: Boolean(materialId),
  })
  useEffect(() => {
    if (error) {
      console.error("Biblio loan decision failed", error)
    }
  }, [error])
  // An earlier answer survives a failed background refetch.
  return { data: data ?? (error ? cannotBeBorrowed : undefined), isLoading }
}
