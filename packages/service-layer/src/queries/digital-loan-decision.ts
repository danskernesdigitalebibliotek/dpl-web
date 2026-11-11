import { queryOptions } from "@tanstack/react-query"

import { getDigitalLoanDecision } from "../digital-loan-decision"
import type { ServiceLayerConfig } from "../types"
import { serviceLayerNamespace } from "./namespace"

export const digitalLoanDecisionQueryKey = (materialId: string | null) =>
  [serviceLayerNamespace, "digitalLoanDecision", materialId] as const

export const digitalLoanDecisionQuery = (config: ServiceLayerConfig, materialId: string | null) =>
  queryOptions({
    queryKey: digitalLoanDecisionQueryKey(materialId),
    // The decision only shapes how a material is shown, so a failure must not
    // take the page down. Callers read a missing decision as unavailable.
    throwOnError: false,
    // The likeliest failure is the adapter's 404 for a material WeDoBooks has
    // not provisioned, and that never resolves by asking again.
    retry: false,
    queryFn: () => {
      if (materialId === null) {
        // The hook disables itself without a material id; a direct caller of
        // the query options must not end up asking about "null".
        throw new Error("digitalLoanDecisionQuery cannot fetch without a material id")
      }
      return getDigitalLoanDecision(config, materialId)
    },
  })
