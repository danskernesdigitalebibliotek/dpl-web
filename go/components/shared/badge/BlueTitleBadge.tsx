"use client"

import React from "react"

import { isPodcastMaterialType } from "@/components/pages/workPageLayout/helper"
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
  // The generated hook only fetches for a non-empty identifier.
  const { data } = useGetV1ProductsIdentifierAdapter(enabled ? isbn || "" : "")
  if (!enabled || !manifestation) return false
  return Boolean(
    data?.product?.costFree ||
    isPodcastMaterialType(manifestation.materialTypes[0]?.materialTypeSpecific.code)
  )
}

// "BLÅ" badge for cost-free titles. Always takes up its space so layouts
// stay stable; fades in when the title turns out to be blue.
const BlueTitleBadge = ({
  manifestation,
  isBlueOverride,
  className,
}: {
  manifestation: BlueTitleManifestation
  // Whether the title is blue, for a caller that has already looked it up —
  // passing it skips the lookup this component would otherwise do itself.
  // Named "override" because the neighbouring `useIsBlueTitle(manifestation,
  // enabled)` takes a boolean too, and that one turns the lookup on and off.
  isBlueOverride?: boolean
  className?: string
}) => {
  const lookedUpIsBlue = useIsBlueTitle(manifestation, isBlueOverride === undefined)
  const resolvedIsBlue = isBlueOverride ?? lookedUpIsBlue

  return (
    <div aria-hidden={!resolvedIsBlue} className={className}>
      <Badge
        variant={"blue-title"}
        className={cn(
          "transition-opacity duration-300",
          resolvedIsBlue ? "opacity-100" : "opacity-0"
        )}>
        BLÅ
      </Badge>
    </div>
  )
}

export default BlueTitleBadge
