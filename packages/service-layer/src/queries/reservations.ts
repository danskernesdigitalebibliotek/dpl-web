import { queryOptions } from "@tanstack/react-query"

import { reservationsQueryKey } from "../queryKeys"
import { getReservations } from "../reservations"
import type { ServiceLayerConfig } from "../types"

export const reservationsQuery = (config: ServiceLayerConfig) =>
  queryOptions({
    queryKey: reservationsQueryKey(),
    queryFn: () => getReservations(config),
  })
