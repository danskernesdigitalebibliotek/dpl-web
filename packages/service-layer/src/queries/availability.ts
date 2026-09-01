import { queryOptions } from "@tanstack/react-query"

import { getMaterialAvailability } from "../availability"
import type { ServiceLayerConfig } from "../types"

export const materialAvailabilityQueryKey = (workId?: string, excludeBranchIds: string[] = []) =>
  workId === undefined
    ? (["serviceLayer", "materialAvailability"] as const)
    : (["serviceLayer", "materialAvailability", workId, excludeBranchIds] as const)

export const materialAvailabilityQuery = (
  config: ServiceLayerConfig,
  workId: string,
  recordIds: string[],
  excludeBranchIds: string[] = []
) =>
  queryOptions({
    queryKey: materialAvailabilityQueryKey(workId, excludeBranchIds),
    queryFn: () => getMaterialAvailability(config, recordIds, excludeBranchIds),
  })
