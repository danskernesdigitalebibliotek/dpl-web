import { queryOptions } from "@tanstack/react-query"

import { getFees } from "../fees"
import type { ServiceLayerConfig } from "../types"
import { serviceLayerNamespace } from "./namespace"

export const feesQueryKey = () => [serviceLayerNamespace, "fees"] as const

export const feesQuery = (config: ServiceLayerConfig) =>
  queryOptions({
    queryKey: feesQueryKey(),
    queryFn: () => getFees(config),
  })
