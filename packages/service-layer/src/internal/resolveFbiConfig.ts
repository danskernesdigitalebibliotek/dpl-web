import type { FbiConfig } from "../../fbi/src"
import type { ServiceLayerConfig } from "../types"

export const resolveFbiConfig = (config: ServiceLayerConfig): FbiConfig => ({
  baseUrl: config.getBaseUrl("fbi"),
  getAuthHeader: () => config.getAuthHeader("fbi"),
})
