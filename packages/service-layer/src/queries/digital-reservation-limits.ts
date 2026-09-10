import { queryOptions } from "@tanstack/react-query"

import { getDigitalReservationLimits } from "../digital-quotas"
import type { ServiceLayerConfig } from "../types"
import { serviceLayerNamespace } from "./namespace"

export const digitalReservationLimitsQueryKey = (organizationId: string | null) =>
  [serviceLayerNamespace, "digitalReservationLimits", organizationId] as const

export const digitalReservationLimitsQuery = (
  config: ServiceLayerConfig,
  organizationId: string | null
) =>
  queryOptions({
    queryKey: digitalReservationLimitsQueryKey(organizationId),
    // The query runs behind the quotas, so re-fetching costs that wait again.
    // Organization configuration changes a few times a year; gcTime follows
    // staleTime, or the entry is collected before it ever goes stale.
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60,
    // Only reached with an organization: useDigitalQuotas gates the query on
    // one, and nothing else can call this.
    queryFn: () => getDigitalReservationLimits(config, organizationId as string),
  })
