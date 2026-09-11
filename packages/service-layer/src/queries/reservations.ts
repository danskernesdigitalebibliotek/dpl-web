import { queryOptions } from "@tanstack/react-query"

import { getReservations } from "../reservations"
import type { ServiceLayerConfig } from "../types"
import { serviceLayerNamespace } from "./namespace"

export const reservationsQueryKey = () => [serviceLayerNamespace, "reservations"] as const

export const reservationsQuery = (config: ServiceLayerConfig) =>
  queryOptions({
    queryKey: reservationsQueryKey(),
    queryFn: () => getReservations(config),
  })
