import { queryOptions } from "@tanstack/react-query"

import { getMaterialAvailability } from "../availability"
import type { ServiceLayerConfig } from "../types"

export const materialAvailabilityQueryKey = (workId?: string) =>
  (workId === undefined
    ? (["serviceLayer", "materialAvailability"] as const)
    : (["serviceLayer", "materialAvailability", workId] as const))

export const materialAvailabilityQuery = (
  config: ServiceLayerConfig,
  workId: string,
  recordIds: string[]
) =>
  queryOptions({
    queryKey: materialAvailabilityQueryKey(workId),
    queryFn: () => getMaterialAvailability(config, recordIds),
  })
