import type { BiblioConfig } from "../../biblio/src"
import type { ServiceLayerConfig } from "../types"

export const resolveBiblioConfig = (config: ServiceLayerConfig): BiblioConfig => ({
  baseUrl: config.getBaseUrl("biblio"),
  getAuthHeader: () => config.getAuthHeader("biblio"),
})
