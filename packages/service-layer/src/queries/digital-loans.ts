import { queryOptions } from "@tanstack/react-query"

import { getDigitalLoans } from "../digital-loans"
import type { ServiceLayerConfig } from "../types"

export const digitalLoansQueryKey = () => ["serviceLayer", "digitalLoans"] as const

export const digitalLoansQuery = (config: ServiceLayerConfig) =>
  queryOptions({
    queryKey: digitalLoansQueryKey(),
    queryFn: () => getDigitalLoans(config),
  })
