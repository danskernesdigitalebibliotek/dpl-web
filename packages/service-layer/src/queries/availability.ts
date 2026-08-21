import { queryOptions } from "@tanstack/react-query"

import { getMaterialAvailability } from "../availability"
import type { ServiceLayerConfig } from "../types"

// Everything the fetch depends on is part of the key — several consumers ask
// about the same work with different record sets (the reservation modal uses
// all physical records, the queue status a single one) and must not share a
// cache entry. Shorter calls return true prefixes for invalidation.
export const materialAvailabilityQueryKey = (
  workId?: string,
  recordIds?: string[],
  excludeBranchIds: string[] = []
) =>
  workId === undefined
    ? (["serviceLayer", "materialAvailability"] as const)
    : recordIds === undefined
      ? (["serviceLayer", "materialAvailability", workId] as const)
      : (["serviceLayer", "materialAvailability", workId, recordIds, excludeBranchIds] as const)

export const materialAvailabilityQuery = (
  config: ServiceLayerConfig,
  workId: string,
  recordIds: string[],
  excludeBranchIds: string[] = []
) =>
  queryOptions({
    queryKey: materialAvailabilityQueryKey(workId, recordIds, excludeBranchIds),
    queryFn: () => getMaterialAvailability(config, recordIds, excludeBranchIds),
  })
