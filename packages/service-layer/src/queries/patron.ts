import { queryOptions } from "@tanstack/react-query"

import { getPatron } from "../patron"
import type { ServiceLayerConfig } from "../types"

export const patronQueryKey = () => ["serviceLayer", "patron"] as const

export const patronQuery = (config: ServiceLayerConfig) =>
  queryOptions({
    queryKey: patronQueryKey(),
    queryFn: () => getPatron(config),
  })
