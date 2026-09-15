import { queryOptions } from "@tanstack/react-query"

import { getDigitalReservations } from "../digital-reservations"
import type { ServiceLayerConfig } from "../types"
import { serviceLayerNamespace } from "./namespace"

export const digitalReservationsQueryKey = () =>
  [serviceLayerNamespace, "digitalReservations"] as const

export const digitalReservationsQuery = (config: ServiceLayerConfig) =>
  queryOptions({
    queryKey: digitalReservationsQueryKey(),
    queryFn: () => getDigitalReservations(config),
  })
