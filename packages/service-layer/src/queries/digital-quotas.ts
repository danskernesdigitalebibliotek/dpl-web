import { queryOptions } from "@tanstack/react-query"

import { getDigitalLoanQuotas } from "../digital-quotas"
import type { ServiceLayerConfig } from "../types"

export const digitalLoanQuotasQueryKey = () => ["serviceLayer", "digitalLoanQuotas"] as const

export const digitalLoanQuotasQuery = (config: ServiceLayerConfig) =>
  queryOptions({
    queryKey: digitalLoanQuotasQueryKey(),
    queryFn: () => getDigitalLoanQuotas(config),
  })
