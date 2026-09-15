import { createBiblioClient } from "../biblio/src"
import { applyCatalogue, lookupCatalogue } from "./catalogue"
import { resolveBiblioConfig } from "./internal/resolveBiblioConfig"
import type { DigitalMaterial, ServiceLayerConfig } from "./types"

// Metadata for one digital material, by the ISBN-13 the provider lends it
// under. Null when the provider has no record of it.
export async function getDigitalMaterial(
  config: ServiceLayerConfig,
  isbn: string
): Promise<DigitalMaterial | null> {
  const biblio = createBiblioClient(resolveBiblioConfig(config))

  // The catalogue is searched for the ISBN the caller passed, so neither
  // request has to wait on the other.
  const [material, catalogue] = await Promise.all([
    biblio.getMetadata(isbn),
    lookupCatalogue(config, [isbn]),
  ])

  return material ? applyCatalogue(material, catalogue.get(isbn)) : null
}
