import { queryOptions } from "@tanstack/react-query"

import { getFees } from "../fees"
import type { ServiceLayerConfig } from "../types"

export const feesQueryKey = () => ["serviceLayer", "fees"] as const

export const feesQuery = (config: ServiceLayerConfig) =>
  queryOptions({
    queryKey: feesQueryKey(),
    queryFn: () => getFees(config),
  })
