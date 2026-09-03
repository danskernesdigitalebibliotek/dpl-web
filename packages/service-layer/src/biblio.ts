import { createBiblioClient } from "../biblio/src"
import { resolveBiblioConfig } from "./internal/resolveBiblioConfig"
import type { BiblioLoan, BiblioMaterial, ServiceLayerConfig } from "./types"

// The endpoint returns active loans only. The cursor is carried through
// untouched: nothing pages through loans yet, but the shape is the adapter's.
export async function getBiblioLoans(
  config: ServiceLayerConfig
): Promise<{ loans: BiblioLoan[]; nextCursor?: string }> {
  const biblio = createBiblioClient(resolveBiblioConfig(config))
  return biblio.getLoans()
}

// Catalogue fields for a material by its ISBN-13. Returns null when the
// material is unknown to Biblio - null rather than undefined, because
// TanStack Query rejects undefined as query data, which would turn "not
// found" into a failed query.
export async function getBiblioMaterial(
  config: ServiceLayerConfig,
  isbn: string
): Promise<BiblioMaterial | null> {
  const biblio = createBiblioClient(resolveBiblioConfig(config))
  return (await biblio.getMetadata(isbn)) ?? null
}
