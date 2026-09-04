import { createFbsClient } from "../fbs/src"
import { resolveFbsConfig } from "./internal/resolveFbsConfig"
import type { CreateReservationInput, CreateReservationResult, ServiceLayerConfig } from "./types"

export async function createReservation(
  config: ServiceLayerConfig,
  input: CreateReservationInput
): Promise<CreateReservationResult> {
  const fbs = createFbsClient(resolveFbsConfig(config))
  return fbs.createReservation(input)
}
