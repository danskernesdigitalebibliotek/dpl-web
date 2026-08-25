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
) => {
  if (workId === undefined) {
    return ["serviceLayer", "materialAvailability"] as const
  }
  if (recordIds === undefined) {
    return ["serviceLayer", "materialAvailability", workId] as const
  }
  return ["serviceLayer", "materialAvailability", workId, recordIds, excludeBranchIds] as const
}

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
