import { createBiblioClient } from "../biblio/src"
import { resolveBiblioConfig } from "./internal/resolveBiblioConfig"
import type { ServiceLayerConfig } from "./types"

// The id a patron gives the library when asking for help with a digital loan.
export async function getDigitalSupportId(config: ServiceLayerConfig): Promise<string> {
  const biblio = createBiblioClient(resolveBiblioConfig(config))
  return biblio.getSupportId()
}
