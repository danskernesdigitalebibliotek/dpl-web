import Link from "next/link"
import React from "react"

import ManifestationCover from "@/components/shared/manifestationCover/ManifestationCover"
import type { Cover } from "@/lib/graphql/generated/fbi/graphql"
import type { MaterialTypeIconNamesType } from "@/lib/types/icons"

type ModalMaterialHeaderProps = {
  cover: Cover
  iconName: MaterialTypeIconNamesType
  // Rendered above the title (e.g. the blue title badge).
  badge?: React.ReactNode
  costFree?: boolean
  iconClassName?: string
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
  badge,
  costFree,
  iconClassName,
  title,
  subtitle,
  alt,
  status,
  href,
}: ModalMaterialHeaderProps) => (
  <div className="flex items-end gap-8">
    <ManifestationCover
      cover={cover}
      iconName={iconName}
      alt={alt}
      className="w-32 shrink-0"
      costFree={costFree}
      iconClassName={iconClassName}
    />
    <div className="flex min-w-0 flex-1 flex-col gap-4 text-left">
      <div className="flex flex-col gap-2">
        {badge}
        {href ? (
          <Link
            prefetch={false}
            href={href}
            className="text-typo-heading-5 focus-visible self-start hover:underline">
            {title}
          </Link>
        ) : (
          <p className="text-typo-heading-5">{title}</p>
        )}
        {subtitle && <p className="text-typo-subtitle-sm text-foreground-muted">{subtitle}</p>}
      </div>
      {status && <div className="flex justify-start">{status}</div>}
    </div>
  </div>
)

export default ModalMaterialHeader
