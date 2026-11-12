"use client"

import React from "react"

import {
  isPhysicalMaterialType,
  isPodcastMaterialType,
} from "@/components/pages/workPageLayout/helper"
import { Badge } from "@/components/shared/badge/Badge"
import { ManifestationSearchPageTeaserFragment } from "@/lib/graphql/generated/fbi/graphql"
import { cn } from "@/lib/helpers/helper.cn"
import { useGetV1ProductsIdentifierAdapter } from "@/lib/rest/publizon/adapter/generated/publizon"

// Both the search teaser and work page manifestation fragments carry these.
type BlueTitleManifestation = Pick<
  ManifestationSearchPageTeaserFragment,
  "identifiers" | "materialTypes"
>

// Whether a manifestation is a cost-free ("BLÅ") title: podcasts always are,
// the rest is looked up in Publizon. False while loading or when disabled.
export const useIsBlueTitle = (
  manifestation: BlueTitleManifestation | undefined,
  enabled = true
): boolean => {
  const isbn = manifestation?.identifiers.find(identifier => identifier.type === "ISBN")?.value
  const isDigital =
    !!manifestation &&
    !isPhysicalMaterialType(manifestation.materialTypes[0]?.materialTypeSpecific.code)
  // Asking about a physical edition would share a query key with the work
  // page's default-edition lookups and send them back to loading.
  const { data } = useGetV1ProductsIdentifierAdapter(isbn || "", {
    query: { enabled: enabled && isDigital && !!isbn },
  })
  if (!enabled || !manifestation) return false
  return Boolean(
    data?.product?.costFree ||
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
