import { createFbsClient } from "../fbs/src"
import { resolveFbsConfig } from "./internal/resolveFbsConfig"
import type { Fee, ServiceLayerConfig } from "./types"

export async function getFees(config: ServiceLayerConfig): Promise<Fee[]> {
  const fbs = createFbsClient(resolveFbsConfig(config))
  return fbs.getFees()
}
