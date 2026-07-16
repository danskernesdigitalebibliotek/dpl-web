import React from "react"

import { CoverPicture } from "@/components/shared/coverPicture/CoverPicture"
import MaterialTypeIconWrapper from "@/components/shared/workCard/MaterialTypeIconWrapper"
import type { Cover } from "@/lib/graphql/generated/fbi/graphql"
import { cn } from "@/lib/helpers/helper.cn"
import type { MaterialTypeIconNamesType } from "@/lib/types/icons"

// The fallback keeps the box from collapsing when cover dimensions are missing.
export const getCoverAspectRatio = (cover: Cover) =>
  cover.large?.width && cover.large?.height
    ? `${cover.large.width} / ${cover.large.height}`
    : "2 / 3"

type ManifestationCoverProps = {
  cover: Cover
  iconName: MaterialTypeIconNamesType
  alt?: string
  className?: string
  iconClassName?: string
  costFree?: boolean
}

// A cover with the material-type icon straddling its bottom edge. The box
// takes the cover's own aspect ratio, so the box edge is the image edge.
const ManifestationCover = ({
  cover,
  iconName,
  alt = "Forsidebillede på værket",
  className,
  iconClassName = "bg-background h-10 w-10",
  costFree,
}: ManifestationCoverProps) => (
  <div className={cn("relative", className)} style={{ aspectRatio: getCoverAspectRatio(cover) }}>
    <CoverPicture alt={alt} covers={cover} className="select-none" />
    <div className="absolute bottom-0 left-1/2 z-10 -translate-x-1/2 translate-y-1/2">
      <MaterialTypeIconWrapper
        iconName={iconName}
        costFree={costFree}
        className={cn("outline-1", iconClassName)}
      />
    </div>
  </div>
)

export default ManifestationCover
