"use client"

import { useQueries } from "@tanstack/react-query"

import { digitalLoanDecisionQuery } from "../queries/digital-loan-decision"
import type { LoanDecision } from "../types"
import { useServiceLayerConfig } from "../context/ServiceLayerContext"

/**
 * The loan decision for several materials at once, keyed by material id.
 *
 * Biblio's loan decision has no batch endpoint, unlike Publizon's loanstatus
 * — this fires one request per material and combines the results, for a
 * caller (e.g. an edition picker) that needs every result before it can
 * settle, the way a single combined request would.
 *
 * Patron-scoped like useDigitalLoanDecision: every query stays disabled
 * without a borrowing session (a patron or a Unilogin user — see
 * canUseDigitalLoans), whatever materialIds holds.
 */
export const useDigitalLoanDecisions = (
  materialIds: string[]
): { decisions: Record<string, LoanDecision>; isLoading: boolean; isError: boolean } => {
  const config = useServiceLayerConfig()
  const canQuery = config.canUseDigitalLoans ?? config.isPatronAuthenticated ?? true

  const results = useQueries({
    queries: materialIds.map(materialId => ({
      ...digitalLoanDecisionQuery(config, materialId),
      enabled: canQuery,
    })),
  })

  const decisions: Record<string, LoanDecision> = {}
  results.forEach((result, index) => {
    if (result.data) {
      decisions[materialIds[index]] = result.data
    }
  })

  return {
    decisions,
    isLoading: canQuery && results.some(result => result.isLoading),
    isError: results.some(result => result.isError),
  }
}
