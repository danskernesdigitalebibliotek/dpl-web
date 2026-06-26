import { queryOptions } from "@tanstack/react-query"

import { getMaterialAvailability } from "../availability"
import { materialAvailabilityQueryKey } from "../queryKeys"
import type { ServiceLayerConfig } from "../types"

export const materialAvailabilityQuery = (
  config: ServiceLayerConfig,
  workId: string,
  recordIds: string[]
) =>
  queryOptions({
    queryKey: materialAvailabilityQueryKey(workId),
    queryFn: () => getMaterialAvailability(config, recordIds),
  })
