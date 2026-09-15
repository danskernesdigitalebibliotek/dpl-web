import { queryOptions } from "@tanstack/react-query"

import { getDigitalLoans, getDigitalMaterialHolding } from "../digital-loans"
import type { ServiceLayerConfig } from "../types"
import { serviceLayerNamespace } from "./namespace"

export const digitalLoansQueryKey = () => [serviceLayerNamespace, "digitalLoans"] as const

export const digitalLoansQuery = (config: ServiceLayerConfig) =>
  queryOptions({
    queryKey: digitalLoansQueryKey(),
    queryFn: () => getDigitalLoans(config),
  })

/**
 * Keyed under the loans key, so the one invalidation a new loan or
 * reservation triggers reaches both this and the list.
 */
export const digitalMaterialHoldingQueryKey = (materialId: string | null) =>
  [serviceLayerNamespace, "digitalLoans", "material", materialId] as const

export const digitalMaterialHoldingQuery = (
  config: ServiceLayerConfig,
  materialId: string | null
) =>
  queryOptions({
    queryKey: digitalMaterialHoldingQueryKey(materialId),
    queryFn: () => {
      if (materialId === null) {
        // The hook disables itself without a material id; a direct caller of
        // the query options must not end up asking about "null".
        throw new Error("digitalMaterialHoldingQuery cannot fetch without a material id")
      }
      return getDigitalMaterialHolding(config, materialId)
    },
  })
