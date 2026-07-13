import React from "react"

import { CoverPicture } from "@/components/shared/coverPicture/CoverPicture"
import MaterialTypeIconWrapper from "@/components/shared/workCard/MaterialTypeIconWrapper"
import type { Cover } from "@/lib/graphql/generated/fbi/graphql"
import { cn } from "@/lib/helpers/helper.cn"
import type { MaterialTypeIconNamesType } from "@/lib/types/icons"

type ManifestationCoverProps = {
  cover: Cover
  iconName: MaterialTypeIconNamesType
  alt?: string
  className?: string
  style?: React.CSSProperties
}

const ManifestationCover = ({
  cover,
  iconName,
  alt = "Forsidebillede på værket",
  className,
  style,
}: ManifestationCoverProps) => (
  <div className={cn("relative", className)} style={style}>
    {/* The icon renders through CoverPicture's badge slot so it straddles the
        visible image edge regardless of the container's aspect ratio. */}
    <CoverPicture
      alt={alt}
      covers={cover}
      badge={
        <MaterialTypeIconWrapper
          iconName={iconName}
          className="bg-background h-10 w-10 outline-1"
        />
      }
    />
  </div>
)

export default ManifestationCover
