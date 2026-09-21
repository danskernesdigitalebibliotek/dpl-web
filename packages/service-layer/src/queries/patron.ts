import { queryOptions } from "@tanstack/react-query"

import { getPatron } from "../patron"
import type { ServiceLayerConfig } from "../types"
import { serviceLayerNamespace } from "./namespace"

export const patronQueryKey = () => [serviceLayerNamespace, "patron"] as const

export const patronQuery = (config: ServiceLayerConfig) =>
  queryOptions({
    queryKey: patronQueryKey(),
    queryFn: () => getPatron(config),
  })
