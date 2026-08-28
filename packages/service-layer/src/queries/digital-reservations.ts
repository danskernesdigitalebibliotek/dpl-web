import { queryOptions } from "@tanstack/react-query"

import { getDigitalReservations } from "../digital-reservations"
import type { ServiceLayerConfig } from "../types"

export const digitalReservationsQueryKey = () => ["serviceLayer", "digitalReservations"] as const

export const digitalReservationsQuery = (config: ServiceLayerConfig) =>
  queryOptions({
    queryKey: digitalReservationsQueryKey(),
    queryFn: () => getDigitalReservations(config),
  })
