import Link from "next/link"
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
  status?: React.ReactNode
  // Makes the title a link (e.g. to the material's work page).
  href?: string
}

const ModalMaterialHeader = ({
  cover,
  iconName,
  title,
  subtitle,
  alt,
  status,
  href,
}: ModalMaterialHeaderProps) => (
  <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-10">
    <ManifestationCover
      cover={cover}
      iconName={iconName}
      alt={alt}
      className="mx-auto w-32 shrink-0 lg:mx-0"
    />
    <div className="mt-auto flex flex-1 flex-col gap-4 text-center lg:text-left">
      <div className="flex flex-col gap-2">
        {href ? (
          <Link
            prefetch={false}
            href={href}
            className="text-typo-heading-5 focus-visible self-center hover:underline lg:self-start">
            {title}
          </Link>
        ) : (
          <p className="text-typo-heading-5">{title}</p>
        )}
        {subtitle && <p className="text-typo-subtitle-sm text-foreground-muted">{subtitle}</p>}
      </div>
      {status && <div className="flex justify-center lg:justify-start">{status}</div>}
    </div>
  </div>
)

export default ModalMaterialHeader
