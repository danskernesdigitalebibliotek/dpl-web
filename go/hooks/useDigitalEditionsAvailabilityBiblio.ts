"use client"

import {
  isMaterialAvailable,
  useDigitalLoanDecisions,
} from "@danskernesdigitalebibliotek/dpl-service-layer"

import {
  isAudioMaterialType,
  isEbookMaterialType,
  isPodcastMaterialType,
} from "@/components/pages/workPageLayout/helper"
import { ManifestationWorkPageFragment } from "@/lib/graphql/generated/fbi/graphql"
import { getPublizonIdentifierFromManifestation } from "@/lib/helpers/ids"

const isDigitalMaterialType = (code: string | undefined): boolean =>
  !!code && (isEbookMaterialType(code) || isAudioMaterialType(code) || isPodcastMaterialType(code))

// Plural counterpart to useDigitalEditionAvailabilityBiblio, for a caller
// (the picker) that lists several editions at once and needs every result
// before it settles — see useDigitalLoanDecisions for why that needs its own
// hook on the service-layer side, Biblio having no batch loan-decision
// endpoint.
export const useDigitalEditionsAvailabilityBiblio = (
  manifestations: ManifestationWorkPageFragment[]
) => {
  const digitalMaterialIds = manifestations
    .filter(manifestation =>
      isDigitalMaterialType(manifestation.materialTypes[0]?.materialTypeSpecific.code)
    )
    .map(getPublizonIdentifierFromManifestation)
    .filter((id): id is string => !!id)

  const { decisions, isLoading, isError } = useDigitalLoanDecisions(digitalMaterialIds)

  const isDigitalEditionOnLoan = (manifestation: ManifestationWorkPageFragment): boolean => {
    if (!isDigitalMaterialType(manifestation.materialTypes[0]?.materialTypeSpecific.code)) {
      return false
    }
    const materialId = getPublizonIdentifierFromManifestation(manifestation)
    if (!materialId) return false

    const decision = decisions[materialId]
    if (!decision) return false

    return !isMaterialAvailable(decision.status)
  }

  return {
    isLoadingDigitalAvailability: digitalMaterialIds.length > 0 && isLoading,
    isDigitalAvailabilityUnknown: isError,
    isDigitalEditionOnLoan,
  }
}
