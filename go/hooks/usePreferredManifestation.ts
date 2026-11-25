"use client"

import { useDigitalLoanDecisions } from "@danskernesdigitalebibliotek/dpl-service-layer"

import { ManifestationWorkPageFragment } from "@/lib/graphql/generated/fbi/graphql"
import { getLoanDecisionMaterialIds, getPreferredManifestation } from "@/lib/helpers/helper.costFree"

// The manifestation a reader lands on, picked from the ones the kommune can
// supply: the newest cost-free ("BLÅ") one, otherwise simply the newest.
// Biblio's loan decision is patron-scoped, so a reader without a borrowing
// session finds no blue one and lands on the newest.
export const usePreferredManifestation = (
  obtainableManifestations: ManifestationWorkPageFragment[]
): { defaultManifestation: ManifestationWorkPageFragment | undefined; isLoading: boolean } => {
  const materialIds = getLoanDecisionMaterialIds(obtainableManifestations)
  const { decisions, isLoading } = useDigitalLoanDecisions(materialIds)

  return {
    defaultManifestation: getPreferredManifestation(obtainableManifestations, decisions),
    isLoading: materialIds.length > 0 && isLoading,
  }
}
