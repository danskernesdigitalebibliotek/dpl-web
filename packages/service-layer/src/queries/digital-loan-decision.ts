import { queryOptions } from "@tanstack/react-query"

import { getDigitalLoanDecision } from "../digital-loan-decision"
import type { ServiceLayerConfig } from "../types"

export const digitalLoanDecisionQueryKey = (materialId: string | null) =>
  ["serviceLayer", "digitalLoanDecision", materialId] as const

export const digitalLoanDecisionQuery = (config: ServiceLayerConfig, materialId: string | null) =>
  queryOptions({
    queryKey: digitalLoanDecisionQueryKey(materialId),
    queryFn: () => {
      if (materialId === null) {
        // The hook disables itself without a material id; a direct caller of
        // the query options must not end up asking about "null".
        throw new Error("digitalLoanDecisionQuery cannot fetch without a material id")
      }
      return getDigitalLoanDecision(config, materialId)
    },
  })
