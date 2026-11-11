import { queryOptions } from "@tanstack/react-query"

import { getDigitalReservationLimits } from "../digital-quotas"
import type { ServiceLayerConfig } from "../types"
import { serviceLayerNamespace } from "./namespace"

export const digitalReservationLimitsQueryKey = () =>
  [serviceLayerNamespace, "digitalReservationLimits"] as const

export const digitalReservationLimitsQuery = (config: ServiceLayerConfig) =>
  queryOptions({
    queryKey: digitalReservationLimitsQueryKey(),
    // Organization configuration changes a few times a year; gcTime follows
    // staleTime, or the entry is collected before it ever goes stale.
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60,
    queryFn: () => getDigitalReservationLimits(config),
  })
