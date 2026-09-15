import { createBiblioClient } from "../biblio/src"
import { resolveBiblioConfig } from "./internal/resolveBiblioConfig"
import type { DigitalMaterial, ServiceLayerConfig } from "./types"

// Catalogue fields for a material by its ISBN-13. Returns null when the
// material is unknown to Biblio - null rather than undefined, because
// TanStack Query rejects undefined as query data, which would turn "not
// found" into a failed query.
export async function getDigitalMaterial(
  config: ServiceLayerConfig,
  isbn: string
): Promise<DigitalMaterial | null> {
  const biblio = createBiblioClient(resolveBiblioConfig(config))
  return (await biblio.getMetadata(isbn)) ?? null
}
