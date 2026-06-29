import type { FbsConfig } from "../../fbs/src/types"
import type { ServiceLayerConfig } from "../types"

export const resolveFbsConfig = (config: ServiceLayerConfig): FbsConfig => ({
  baseUrl: config.getBaseUrl("fbs"),
  getAuthHeader: () => config.getAuthHeader("fbs"),
})
