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
}

const ModalMaterialHeader = ({
  cover,
  iconName,
  title,
  subtitle,
  alt,
}: ModalMaterialHeaderProps) => (
  <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-10">
    <ManifestationCover
      cover={cover}
      iconName={iconName}
      alt={alt}
      className="mx-auto aspect-[4/5] w-32 shrink-0 lg:mx-0"
    />
    <div className="mt-auto flex flex-1 flex-col gap-2 text-center lg:text-left">
      <p className="text-typo-heading-5 break-words">{title}</p>
      {subtitle && <p className="text-typo-subtitle-sm text-foreground-muted">{subtitle}</p>}
    </div>
  </div>
)

export default ModalMaterialHeader
