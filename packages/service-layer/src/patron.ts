import { createFbsClient } from "../fbs/src"
import { resolveFbsConfig } from "./internal/resolveFbsConfig"
import type { Patron, ServiceLayerConfig } from "./types"

export async function getPatron(config: ServiceLayerConfig): Promise<Patron | undefined> {
  const fbs = createFbsClient(resolveFbsConfig(config))
  return fbs.getPatron()
}
