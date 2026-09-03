import { queryOptions } from "@tanstack/react-query"

import { getDigitalLoans } from "../digital-loans"
import type { ServiceLayerConfig } from "../types"
import { serviceLayerNamespace } from "./namespace"

export const digitalLoansQueryKey = () => [serviceLayerNamespace, "digitalLoans"] as const

export const digitalLoansQuery = (config: ServiceLayerConfig) =>
  queryOptions({
    queryKey: digitalLoansQueryKey(),
    queryFn: () => getDigitalLoans(config),
  })
