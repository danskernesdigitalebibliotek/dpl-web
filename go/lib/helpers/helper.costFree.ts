import { LoanDecision, isCostFreeLoan } from "@danskernesdigitalebibliotek/dpl-service-layer"

import {
  isDigitalMaterialType,
  isPodcastMaterialType,
} from "@/components/pages/workPageLayout/helper"
import { ManifestationWorkPageFragment } from "@/lib/graphql/generated/fbi/graphql"
import { getPublizonIdentifierFromManifestation } from "@/lib/helpers/ids"

// The fields the cost-free ("BLÅ") check reads. Both the work page and the
// search teaser fragments carry them.
type TCostFreeManifestation = Pick<ManifestationWorkPageFragment, "identifiers" | "materialTypes">

const getMaterialTypeCode = (manifestation: TCostFreeManifestation) =>
  manifestation.materialTypes[0]?.materialTypeSpecific.code

// The id Biblio's loan decision is asked about. Physical manifestations have none.
export const getLoanDecisionMaterialId = (
  manifestation: TCostFreeManifestation
): string | undefined =>
  isDigitalMaterialType(getMaterialTypeCode(manifestation))
    ? getPublizonIdentifierFromManifestation(manifestation)
    : undefined

export const getLoanDecisionMaterialIds = (manifestations: TCostFreeManifestation[]): string[] =>
  manifestations.map(getLoanDecisionMaterialId).filter((id): id is string => !!id)

// Podcasts are always cost-free. Other digital manifestations are cost-free
// when the loan decision says so. Physical ones never are.
export const isManifestationCostFree = (
  manifestation: TCostFreeManifestation,
  decisions: Record<string, LoanDecision>
): boolean => {
  if (isPodcastMaterialType(getMaterialTypeCode(manifestation))) return true

  const materialId = getLoanDecisionMaterialId(manifestation)
  if (!materialId) return false

  return isCostFreeLoan(decisions[materialId]?.loanProvider)
}

// The newest cost-free manifestation, else the newest. Expects newest first.
export const getPreferredManifestation = <TManifestation extends TCostFreeManifestation>(
  manifestations: TManifestation[],
  decisions: Record<string, LoanDecision>
): TManifestation | undefined =>
  manifestations.find(manifestation => isManifestationCostFree(manifestation, decisions)) ??
  manifestations[0]
