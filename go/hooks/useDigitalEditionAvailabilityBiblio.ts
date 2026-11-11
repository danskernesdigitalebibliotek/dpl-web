"use client"

import { isMaterialAvailable, useDigitalLoanDecision } from "@danskernesdigitalebibliotek/dpl-service-layer"

import {
  isAudioMaterialType,
  isEbookMaterialType,
  isPodcastMaterialType,
} from "@/components/pages/workPageLayout/helper"
import { ManifestationWorkPageFragment } from "@/lib/graphql/generated/fbi/graphql"
import { getPublizonIdentifierFromManifestation } from "@/lib/helpers/ids"

const isDigitalMaterialType = (code: string | undefined): boolean =>
  !!code && (isEbookMaterialType(code) || isAudioMaterialType(code) || isPodcastMaterialType(code))

// One hook call answers for one manifestation — unlike Publizon's batch
// loanstatus endpoint, Biblio's loan decision takes a single material id, so
// a caller that needs several editions at once (the picker) makes one call
// per edition rather than one call for the list; see
// useDigitalEditionsAvailabilityBiblio for that case.
//
// Whether a digital edition can be borrowed right now, via the Biblio
// adapter. Biblio's loan decision is patron-scoped — it has no equivalent of
// Publizon's agency-level answer, so without a borrowing session (see
// ServiceLayerConfig.canUseDigitalLoans) there is nothing to ask. For that
// session, and for anything the decision hasn't resolved yet, the edition is
// treated as borrowable: the alternative is marking the whole catalogue
// unavailable for every anonymous reader, which is a worse answer than
// occasionally sending a signed-out reader toward a loan that turns out to
// be unavailable only once they sign in. The loan attempt itself is the
// fail-safe that catches this and explains it.
export const useDigitalEditionAvailabilityBiblio = (
  manifestation: ManifestationWorkPageFragment | undefined
) => {
  const isDigital = isDigitalMaterialType(
    manifestation?.materialTypes[0]?.materialTypeSpecific.code
  )
  const materialId = isDigital ? getPublizonIdentifierFromManifestation(manifestation) : undefined

  const {
    data: loanDecision,
    isLoading,
    isError,
  } = useDigitalLoanDecision(materialId ?? null, { enabled: !!materialId })

  const isDigitalEditionOnLoan =
    isDigital && !isLoading && !isError && !!loanDecision
      ? !isMaterialAvailable(loanDecision.status)
      : false

  return {
    isLoadingDigitalAvailability: isDigital && !!materialId && isLoading,
    isDigitalAvailabilityUnknown: isError,
    isDigitalEditionOnLoan,
  }
}
