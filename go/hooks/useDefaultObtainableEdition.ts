"use client"

import {
  isCostFreeLoan,
  useDigitalLoanDecisions,
} from "@danskernesdigitalebibliotek/dpl-service-layer"

import {
  isDigitalMaterialType,
  isPodcastMaterialType,
} from "@/components/pages/workPageLayout/helper"
import { ManifestationWorkPageFragment } from "@/lib/graphql/generated/fbi/graphql"
import { getPublizonIdentifierFromManifestation } from "@/lib/helpers/ids"

// Picks the manifestation a reader lands on by default: the newest cost-free
// ("BLÅ") one the kommune can supply, otherwise simply the newest. Biblio's
// loan decision is patron-scoped, so a reader without a borrowing session
// finds no blue one and lands on the newest.
export const useDefaultObtainableEdition = (
  obtainableManifestations: ManifestationWorkPageFragment[]
): { defaultManifestation: ManifestationWorkPageFragment | undefined; isLoading: boolean } => {
  const materialIds = obtainableManifestations
    .filter(manifestation =>
      isDigitalMaterialType(manifestation.materialTypes[0]?.materialTypeSpecific.code)
    )
    .map(getPublizonIdentifierFromManifestation)
    .filter((id): id is string => !!id)

  const { decisions, isLoading } = useDigitalLoanDecisions(materialIds)

  // Podcasts are always cost-free; everything else is whatever the decision
  // says. A physical manifestation is never asked about and never blue.
  const isCostFree = (manifestation: ManifestationWorkPageFragment): boolean => {
    if (isPodcastMaterialType(manifestation.materialTypes[0]?.materialTypeSpecific.code)) {
      return true
    }
    const materialId = getPublizonIdentifierFromManifestation(manifestation)
    if (!materialId) return false

    return isCostFreeLoan(decisions[materialId]?.loanProvider)
  }

  // obtainableManifestations is newest first, so the first blue one found is
  // the newest blue one.
  const newestBlueManifestation = obtainableManifestations.find(isCostFree)

  return {
    defaultManifestation: newestBlueManifestation ?? obtainableManifestations[0],
    isLoading: materialIds.length > 0 && isLoading,
  }
}
