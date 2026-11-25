"use client"

import { useDigitalLoanDecisions } from "@danskernesdigitalebibliotek/dpl-service-layer"

import { getWorkCardMaterialTypes } from "@/components/shared/workCard/helper"
import { ManifestationSearchPageTeaserFragment } from "@/lib/graphql/generated/fbi/graphql"
import {
  getLoanDecisionMaterialIds,
  getPreferredManifestation,
  isManifestationCostFree,
} from "@/lib/helpers/helper.costFree"

type UseWorkTeaserManifestationArgs = {
  // Every manifestation of the work, for the material type icons.
  manifestations: ManifestationSearchPageTeaserFragment[]
  // The manifestations of the linked material type, newest first.
  linkedManifestations: ManifestationSearchPageTeaserFragment[]
  // Holds the loan decisions back until the teaser is in view.
  isEnabled: boolean
}

// The manifestation a work teaser shows: the one the work page lands on,
// i.e. the newest cost-free ("BLÅ") one of the linked type, else the newest.
// Also says which material types are cost-free, from the same decisions.
export const useWorkTeaserManifestation = ({
  manifestations,
  linkedManifestations,
  isEnabled,
}: UseWorkTeaserManifestationArgs) => {
  const { decisions, isLoading } = useDigitalLoanDecisions(
    isEnabled ? getLoanDecisionMaterialIds(manifestations) : []
  )

  const materialTypes = getWorkCardMaterialTypes(manifestations, manifestation =>
    isManifestationCostFree(manifestation, decisions)
  )

  return {
    manifestation: getPreferredManifestation(linkedManifestations, decisions),
    materialTypes,
    isBlueTitle: materialTypes.some(materialType => materialType.isCostFree),
    isLoading,
  }
}
