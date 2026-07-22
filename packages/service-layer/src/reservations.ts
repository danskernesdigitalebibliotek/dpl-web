import { createFbsClient } from "../fbs/src"
import { resolveFbsConfig } from "./internal/resolveFbsConfig"
import type { Reservation, ServiceLayerConfig } from "./types"

export async function getReservations(config: ServiceLayerConfig): Promise<Reservation[]> {
  const fbs = createFbsClient(resolveFbsConfig(config))
  return fbs.getReservations()
}

export async function deleteReservation(
  config: ServiceLayerConfig,
  reservationId: number
): Promise<void> {
  const fbs = createFbsClient(resolveFbsConfig(config))
  return fbs.deleteReservation(reservationId)
}
