import { createBiblioClient } from "../biblio/src"
import { resolveBiblioConfig } from "./internal/resolveBiblioConfig"
import type { DigitalSample, ServiceLayerConfig } from "./types"

/**
 * The promotional excerpt of a material, or null when it has none.
 *
 * Null rather than undefined, because TanStack Query rejects undefined as
 * query data, which would turn "no sample" - a valid answer - into a failed
 * query. Same rule as getDigitalMaterial.
 *
 * Not patron-scoped: this is what lets a visitor who is not signed in try a
 * material before borrowing it.
 */
export async function getDigitalSample(
  config: ServiceLayerConfig,
  materialId: string
): Promise<DigitalSample | null> {
  const biblio = createBiblioClient(resolveBiblioConfig(config))
  return (await biblio.getSample(materialId)) ?? null
}
