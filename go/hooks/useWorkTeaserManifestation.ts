"use client"

import {
  useDigitalLoanDecisions,
  useServiceLayerConfig,
} from "@danskernesdigitalebibliotek/dpl-service-layer"
import { useEffect, useState } from "react"

import { getWorkCardMaterialTypes } from "@/components/shared/workCard/helper"
import { ManifestationSearchPageTeaserFragment } from "@/lib/graphql/generated/fbi/graphql"
import {
  getLoanDecisionMaterialIds,
  getPreferredManifestation,
  isManifestationCostFree,
} from "@/lib/helpers/helper.costFree"
import { useIsServiceLayerSessionResolved } from "@/lib/providers/ServiceLayerProvider"

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
  const isSessionResolved = useIsServiceLayerSessionResolved()
  // Mirrors the service layer's own gate, which falls back to the patron
  // flag for consumers that do not set the digital one.
  const config = useServiceLayerConfig()
  const canUseDigitalLoans = config.canUseDigitalLoans ?? config.isPatronAuthenticated ?? true
  const { decisions, isLoading } = useDigitalLoanDecisions(
    isEnabled ? getLoanDecisionMaterialIds(manifestations) : []
  )

  const materialTypes = getWorkCardMaterialTypes(manifestations, manifestation =>
    isManifestationCostFree(manifestation, decisions)
  )

  // The pick is made once the session is known and, with a borrowing
  // session, once the decisions have been asked for and have landed. Without
  // one nothing is asked, so the pick is the newest. Remembered from then on,
  // so a background refetch, or a request for the same material started
  // elsewhere, does not reopen it.
  const isDeciding = !isSessionResolved || (canUseDigitalLoans && (!isEnabled || isLoading))
  const [hasDecided, setHasDecided] = useState(false)
  useEffect(() => {
    if (!isDeciding) setHasDecided(true)
  }, [isDeciding])

  return {
    manifestation: getPreferredManifestation(linkedManifestations, decisions),
    materialTypes,
    isBlueTitle: materialTypes.some(materialType => materialType.isCostFree),
    isWaiting: isDeciding && !hasDecided,
  }
}
