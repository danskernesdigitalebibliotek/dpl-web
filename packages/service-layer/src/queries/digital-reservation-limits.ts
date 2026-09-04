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
    // Organization configuration changes a few times a year, and this query
    // only runs once the quotas have answered - so the host's two-minute
    // default would re-pay that wait on every visit and every window focus.
    staleTime: 1000 * 60 * 60,
    queryFn: () => {
      if (organizationId === null) {
        // The hook disables itself without an organization; a direct caller
        // of the query options must not end up asking about "null".
        throw new Error("digitalReservationLimitsQuery cannot fetch without an organization id")
      }
      return getDigitalReservationLimits(config, organizationId)
    },
  })
