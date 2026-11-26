"use client"

import {
  type LoanDecision,
  useCanUseDigitalLoans,
  useDigitalLoanDecisions,
} from "@danskernesdigitalebibliotek/dpl-service-layer"
import { useEffect, useState } from "react"

import {
  type TCostFreeManifestation,
  getLoanDecisionMaterialIds,
  getPreferredManifestation,
} from "@/lib/helpers/helper.costFree"
import { useIsServiceLayerSessionResolved } from "@/lib/providers/ServiceLayerProvider"

type UsePreferredManifestationOptions = {
  // Holds the loan decisions back, e.g. until a teaser is in view.
  isEnabled?: boolean
  // What the pick is for, e.g. the material type. A new key is a new pick.
  key?: string | null
  // Further manifestations to ask about in the same lookup, so their
  // decisions are in before the pick counts as made.
  alsoAskAbout?: TCostFreeManifestation[]
}

// The manifestation a reader lands on: the newest cost-free ("BLÅ") one of
// `manifestations` (newest first), otherwise the newest. Biblio's loan
// decision is patron-scoped, so without a borrowing session nothing is asked
// and the pick is the newest.
//
// With a digital manifestation, `isWaiting` holds until the session is known
// and, with a borrowing session, the decisions have landed. It does not come
// back for the same key, so a background refetch, or a request for the same
// material started elsewhere, does not reopen the pick. `manifestation` itself
// follows its inputs.
export const usePreferredManifestation = <TManifestation extends TCostFreeManifestation>(
  manifestations: TManifestation[],
  { isEnabled = true, key = null, alsoAskAbout = [] }: UsePreferredManifestationOptions = {}
): {
  manifestation: TManifestation | undefined
  decisions: Record<string, LoanDecision>
  isWaiting: boolean
} => {
  const isSessionResolved = useIsServiceLayerSessionResolved()
  const canUseDigitalLoans = useCanUseDigitalLoans()

  const materialIds = getLoanDecisionMaterialIds([...manifestations, ...alsoAskAbout])
  const { decisions, isLoading } = useDigitalLoanDecisions(isEnabled ? materialIds : [])

  // Without a digital manifestation the pick is the newest whoever is signed
  // in, so there is nothing to wait for, not even the session.
  const isDeciding =
    materialIds.length > 0 &&
    (!isSessionResolved || (canUseDigitalLoans && (!isEnabled || isLoading)))

  const [decidedKey, setDecidedKey] = useState<{ key: string | null }>()
  useEffect(() => {
    if (!isDeciding) setDecidedKey({ key })
  }, [isDeciding, key])
  const hasDecided = decidedKey?.key === key

  return {
    manifestation: getPreferredManifestation(manifestations, decisions),
    decisions,
    isWaiting: isDeciding && !hasDecided,
  }
}
