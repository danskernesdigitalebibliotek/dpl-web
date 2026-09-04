"use client"

import type { UseQueryResult } from "@tanstack/react-query"

import {
  digitalLoanDecisionQuery,
  type digitalLoanDecisionQueryKey,
} from "../queries/digital-loan-decision"
import type { LoanDecision } from "../types"
import { type DigitalQueryOptions, useDigitalQuery } from "./internal"

/**
 * Whether the user can borrow a material through the Biblio adapter.
 *
 * Patron-scoped: the adapter answers 403 to a library token, which with
 * errors surfaced takes the whole page down, so the hook refuses to ask
 * without a patron.
 */
export const useDigitalLoanDecision = (
  materialId: string | null,
  options?: DigitalQueryOptions<LoanDecision, ReturnType<typeof digitalLoanDecisionQueryKey>>
): UseQueryResult<LoanDecision, Error> =>
  useDigitalQuery({
    query: config => digitalLoanDecisionQuery(config, materialId),
    options,
    requires: Boolean(materialId),
  })
