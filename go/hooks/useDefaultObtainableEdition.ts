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

// Picks the edition a reader lands on by default: the newest cost-free
// ("BLÅ") one the kommune can supply, otherwise simply the newest.
//
// Biblio's loan decision is patron-scoped, so it answers nothing for a reader
// without a borrowing session and the pick falls through to the newest
// edition. That fallback is the whole handling of the anonymous case — no
// branch on the session, and nothing to undo here once Biblio can answer
// without one.
export const useDefaultObtainableEdition = (
  obtainableEditions: ManifestationWorkPageFragment[]
): { defaultManifestation: ManifestationWorkPageFragment | undefined; isLoading: boolean } => {
  const materialIds = obtainableEditions
    .filter(manifestation =>
      isDigitalMaterialType(manifestation.materialTypes[0]?.materialTypeSpecific.code)
    )
    .map(getPublizonIdentifierFromManifestation)
    .filter((id): id is string => !!id)

  const { decisions, isLoading } = useDigitalLoanDecisions(materialIds)

  // Podcasts are always cost-free; everything else is whatever the decision
  // says. A physical edition is never asked about and never blue.
  const isCostFree = (manifestation: ManifestationWorkPageFragment): boolean => {
    if (isPodcastMaterialType(manifestation.materialTypes[0]?.materialTypeSpecific.code)) {
      return true
    }
    const materialId = getPublizonIdentifierFromManifestation(manifestation)
    if (!materialId) return false

    return isCostFreeLoan(decisions[materialId]?.loanProvider)
  }

  // obtainableEditions is newest first, so the first blue one found is the
  // newest blue one.
  const newestBlue = obtainableEditions.find(isCostFree)

  return {
    defaultManifestation: newestBlue ?? obtainableEditions[0],
    // The batch hook settles as one, so unlike the per-edition lookups it
    // replaces there is no answer to wait on selectively.
    isLoading: materialIds.length > 0 && isLoading,
  }
}
