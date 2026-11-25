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
  // The cover and the icon share the box's one grid cell. The cover is
  // stretched to fill it; the icon sits centred on its bottom edge.
  <div
    className={cn("grid grid-cols-1 grid-rows-1", className)}
    style={{ aspectRatio: getCoverAspectRatio(cover) }}>
    <CoverPicture
      alt={alt}
      covers={cover}
      className="col-start-1 row-start-1 h-auto w-auto select-none"
    />
    <div className="z-10 col-start-1 row-start-1 translate-y-1/2 self-end justify-self-center">
      <MaterialTypeIconWrapper
        iconName={iconName}
        costFree={costFree}
        className={cn("outline-1", iconClassName)}
      />
    </div>
  </div>
)

export default ManifestationCover
