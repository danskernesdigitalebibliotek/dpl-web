import React from "react"

import ManifestationCover from "@/components/shared/manifestationCover/ManifestationCover"
import type { Cover } from "@/lib/graphql/generated/fbi/graphql"
import type { MaterialTypeIconNamesType } from "@/lib/types/icons"

type ModalMaterialHeaderProps = {
  cover: Cover
  iconName: MaterialTypeIconNamesType
  title: string
  subtitle?: string | null
  alt?: string
  // E.g. a due-status label rendered under the subtitle.
  status?: React.ReactNode
}

const ModalMaterialHeader = ({
  cover,
  iconName,
  title,
  subtitle,
  alt,
  status,
}: ModalMaterialHeaderProps) => (
  <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-10">
    {/* The cover box adopts the cover's own aspect ratio so square covers
        align like tall ones instead of floating in a fixed box. */}
    <ManifestationCover
      cover={cover}
      iconName={iconName}
      alt={alt}
      className="mx-auto w-32 shrink-0 lg:mx-0"
      style={{
        aspectRatio:
          cover.large?.width && cover.large?.height
            ? `${cover.large.width} / ${cover.large.height}`
            : "4 / 5",
      }}
    />
    <div className="mt-auto flex flex-1 flex-col gap-2 text-center lg:text-left">
      <p className="text-typo-heading-5">{title}</p>
      {subtitle && <p className="text-typo-subtitle-sm text-foreground-muted">{subtitle}</p>}
      {status && <div className="flex justify-center pt-1 lg:justify-start">{status}</div>}
    </div>
  </div>
)

export default ModalMaterialHeader
