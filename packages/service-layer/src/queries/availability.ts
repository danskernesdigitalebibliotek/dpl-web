import { queryOptions } from "@tanstack/react-query"

import { getMaterialAvailability } from "../availability"
import type { ServiceLayerConfig } from "../types"
import { serviceLayerNamespace } from "./namespace"

// Everything the fetch depends on is part of the key — several consumers ask
// about the same work with different record sets (the reservation modal uses
// all physical records, the queue status a single one) and must not share a
// cache entry. The reservation mutation hooks invalidate by prefixes of this
// key, written out where they invalidate.
export const materialAvailabilityQueryKey = (
  workId: string,
  recordIds: string[],
  excludeBranchIds: string[] = []
) => [serviceLayerNamespace, "materialAvailability", workId, recordIds, excludeBranchIds] as const

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
