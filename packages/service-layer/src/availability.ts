import { createFbsClient } from "../fbs/src"
import { resolveFbsConfig } from "./internal/resolveFbsConfig"
import type { MaterialAvailability, ServiceLayerConfig } from "./types"

export async function getMaterialAvailability(
  config: ServiceLayerConfig,
  recordIds: string[]
): Promise<MaterialAvailability> {
  const fbs = createFbsClient(resolveFbsConfig(config))
  return fbs.getMaterialAvailability(recordIds)
}
