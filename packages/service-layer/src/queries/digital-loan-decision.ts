import { queryOptions } from "@tanstack/react-query"

import { BiblioHttpError } from "../../biblio/src"
import { getDigitalLoanDecision } from "../digital-loan-decision"
import type { ServiceLayerConfig } from "../types"
import { serviceLayerNamespace } from "./namespace"

export const digitalLoanDecisionQueryKey = (materialId: string | null) =>
  [serviceLayerNamespace, "digitalLoanDecision", materialId] as const

// What asking again can change: an outage, or a dropped connection - fetch
// rejects with a TypeError when the network fails.
const isTransient = (error: unknown) =>
  error instanceof TypeError || (error instanceof BiblioHttpError && error.status >= 500)

// The decision only shapes how a material is shown, so an adapter or network
// failure must not take the page down. An expired session, a missing token or
// base url is broken setup that must stay visible.
const staysOffBoundary = (error: unknown) =>
  error instanceof TypeError || (error instanceof BiblioHttpError && error.status !== 401)

// A failed query has no data and so is always stale; without this every new
// observer and every window focus would ask again for a lasting failure.
const shouldRefetch = (query: { state: { error: Error | null } }) =>
  query.state.error === null || isTransient(query.state.error)

export const digitalLoanDecisionQuery = (config: ServiceLayerConfig, materialId: string | null) =>
  queryOptions({
    queryKey: digitalLoanDecisionQueryKey(materialId),
    // Callers treat a failure kept off the boundary as "cannot be borrowed".
    throwOnError: error => !staysOffBoundary(error),
    retry: (failureCount, error) => {
      const tryAgain = isTransient(error) && failureCount < 3
      // Logged once the query gives up rather than per attempt, and only what
      // the boundary will not show.
      if (!tryAgain && staysOffBoundary(error)) {
        console.error("Biblio loan decision failed", error)
      }
      return tryAgain
    },
    retryOnMount: shouldRefetch,
    refetchOnWindowFocus: shouldRefetch,
    refetchOnReconnect: shouldRefetch,
    queryFn: () => {
      if (materialId === null) {
        // The hook disables itself without a material id; a direct caller of
        // the query options must not end up asking about "null".
        throw new Error("digitalLoanDecisionQuery cannot fetch without a material id")
      }
      return getDigitalLoanDecision(config, materialId)
    },
  })
