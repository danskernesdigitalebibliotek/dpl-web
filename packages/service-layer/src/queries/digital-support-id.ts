import { queryOptions } from "@tanstack/react-query"

import { getDigitalSupportId } from "../digital-support-id"
import type { ServiceLayerConfig } from "../types"
import { serviceLayerNamespace } from "./namespace"

export const digitalSupportIdQueryKey = () => [serviceLayerNamespace, "digitalSupportId"] as const

export const digitalSupportIdQuery = (config: ServiceLayerConfig) =>
  queryOptions({
    queryKey: digitalSupportIdQueryKey(),
    queryFn: () => getDigitalSupportId(config),
  })
