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
  /** Outer relative container — set width/height/aspect here. */
  className?: string
  /** Material-type badge — set bottom/left offsets here. Defaults to `-bottom-6`. */
  badgeClassName?: string
}

const ManifestationCover = ({
  cover,
  iconName,
  alt = "Forsidebillede på værket",
  className,
}: ManifestationCoverProps) => (
  <div className={cn("relative", className)}>
    <CoverPicture alt={alt} covers={cover} />
    <MaterialTypeIconWrapper
      iconName={iconName}
      className={cn(
        `bg-background absolute top-full left-1/2 h-10 w-10 translate-x-[-50%] -translate-y-[50%]
        transform outline-1`
      )}
    />
  </div>
)

export default ManifestationCover
