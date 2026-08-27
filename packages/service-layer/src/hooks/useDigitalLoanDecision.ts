"use client"

import type { UseQueryResult } from "@tanstack/react-query"

import { digitalLoanDecisionQuery, type digitalLoanDecisionQueryKey } from "../queries/biblio"
import type { LoanDecision } from "../types"
import { type DigitalQueryOptions, useDigitalQuery } from "./internal"

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
  options?: DigitalQueryOptions<LoanDecision | null, ReturnType<typeof digitalLoanDecisionQueryKey>>
): UseQueryResult<LoanDecision | null, Error> =>
  useDigitalQuery({
    query: config => digitalLoanDecisionQuery(config, materialId),
    options,
    requires: Boolean(materialId),
  })
