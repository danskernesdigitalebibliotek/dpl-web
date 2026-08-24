import { createBiblioClient } from "../biblio/src"
import { resolveBiblioConfig } from "./internal/resolveBiblioConfig"
import type {
  BiblioCanLoan,
  BiblioCanLoanStatus,
  BiblioLoan,
  BiblioMaterial,
  ServiceLayerConfig,
} from "./types"

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

// Whether the user can borrow a material right now. The answer covers both the
// material (is it available?) and the user (quota, lending blocks), so callers
// must pick the part they care about - see isBiblioMaterialAvailable.
export async function getBiblioCanLoan(
  config: ServiceLayerConfig,
  materialId: string
): Promise<BiblioCanLoan> {
  const biblio = createBiblioClient(resolveBiblioConfig(config))
  return biblio.canLoan(materialId)
}

/**
 * Whether the MATERIAL itself can be borrowed right now.
 *
 * Statuses that describe the user rather than the material - an exhausted
 * quota, blocked lending, missing credentials - leave the material itself
 * available. This mirrors Publizon, where status 0 ("not loanable, max loans
 * reached") is also counted as available.
 */
export const isBiblioMaterialAvailable = (status: BiblioCanLoanStatus): boolean => {
  switch (status) {
    // The material cannot be borrowed now: it can at most be reserved or
    // wished for. Equivalent to Publizon's status 5 (reservation queue).
    case "reservable":
    case "wishable":
    case "unavailable":
      return false
    default:
      return true
  }
}
