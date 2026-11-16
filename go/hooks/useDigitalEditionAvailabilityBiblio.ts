"use client"

import {
  isMaterialAvailable,
  useDigitalLoanDecision,
} from "@danskernesdigitalebibliotek/dpl-service-layer"

import { isDigitalMaterialType } from "@/components/pages/workPageLayout/helper"
import { ManifestationWorkPageFragment } from "@/lib/graphql/generated/fbi/graphql"
import { getPublizonIdentifierFromManifestation } from "@/lib/helpers/ids"

// Whether one digital edition can be borrowed right now. Biblio's loan
// decision is patron-scoped, so without a borrowing session the edition
// counts as borrowable. See useDigitalEditionsAvailabilityBiblio for several.
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
