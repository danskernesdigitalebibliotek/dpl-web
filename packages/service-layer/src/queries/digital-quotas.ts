import { queryOptions } from "@tanstack/react-query"

import { getDigitalLoanQuotas } from "../digital-quotas"
import type { ServiceLayerConfig } from "../types"
import { serviceLayerNamespace } from "./namespace"

export const digitalLoanQuotasQueryKey = () => [serviceLayerNamespace, "digitalLoanQuotas"] as const

export const digitalLoanQuotasQuery = (config: ServiceLayerConfig) =>
  queryOptions({
    queryKey: digitalLoanQuotasQueryKey(),
    queryFn: () => getDigitalLoanQuotas(config),
  })
