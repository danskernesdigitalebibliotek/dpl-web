import { queryOptions } from "@tanstack/react-query"

import { getLoans } from "../loans"
import type { ServiceLayerConfig } from "../types"
import { serviceLayerNamespace } from "./namespace"

export const loansQueryKey = () => [serviceLayerNamespace, "loans"] as const

export const loansQuery = (config: ServiceLayerConfig) =>
  queryOptions({
    queryKey: loansQueryKey(),
    queryFn: () => getLoans(config),
  })
