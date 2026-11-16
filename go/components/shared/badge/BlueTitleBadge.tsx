"use client"

import {
  isCostFreeLoan,
  useDigitalLoanDecision,
} from "@danskernesdigitalebibliotek/dpl-service-layer"
import React from "react"

import {
  isPhysicalMaterialType,
  isPodcastMaterialType,
} from "@/components/pages/workPageLayout/helper"
import { Badge } from "@/components/shared/badge/Badge"
import { ManifestationSearchPageTeaserFragment } from "@/lib/graphql/generated/fbi/graphql"
import { cn } from "@/lib/helpers/helper.cn"
import { getPublizonIdentifierFromManifestation } from "@/lib/helpers/ids"

// Both the search teaser and work page manifestation fragments carry these.
type BlueTitleManifestation = Pick<
  ManifestationSearchPageTeaserFragment,
  "identifiers" | "materialTypes"
>

// Whether a manifestation is a cost-free ("BLÅ") title: podcasts always are,
// the rest is whatever Biblio's loan decision says.
//
// That decision is patron-scoped, so a reader without a borrowing session is
// answered false rather than asked. A false negative only hides the badge; it
// never claims a title is included when it is not.
export const useIsBlueTitle = (
  manifestation: BlueTitleManifestation | undefined,
  enabled = true
): boolean => {
  const materialId = getPublizonIdentifierFromManifestation(manifestation)
  const isDigital =
    !!manifestation &&
    !isPhysicalMaterialType(manifestation.materialTypes[0]?.materialTypeSpecific.code)
  const { data: loanDecision } = useDigitalLoanDecision(
    enabled && isDigital ? (materialId ?? null) : null
  )
  if (!enabled || !manifestation) return false
  return Boolean(
    isCostFreeLoan(loanDecision?.loanProvider) ||
    isPodcastMaterialType(manifestation.materialTypes[0]?.materialTypeSpecific.code)
  )
}

// "BLÅ" badge for cost-free titles. Always takes up its space so layouts
// stay stable; fades in when the title turns out to be blue.
const BlueTitleBadge = ({
  isBlue,
  className,
}: {
  // Decided by the caller, which has the answer from `useIsBlueTitle`.
  isBlue: boolean
  className?: string
}) => {
  return (
    <div aria-hidden={!isBlue} className={className}>
      <Badge
        variant={"blue-title"}
        className={cn("transition-opacity duration-300", isBlue ? "opacity-100" : "opacity-0")}>
        BLÅ
      </Badge>
    </div>
  )
}

export default BlueTitleBadge
