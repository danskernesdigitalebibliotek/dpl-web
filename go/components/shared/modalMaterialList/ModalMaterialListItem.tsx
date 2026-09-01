"use client"

import React from "react"

import { getManifestationMaterialTypeIcon } from "@/components/pages/workPageLayout/helper"
import BlueTitleBadge, { useIsBlueTitle } from "@/components/shared/badge/BlueTitleBadge"
import ManifestationCover from "@/components/shared/manifestationCover/ManifestationCover"
import { ManifestationSearchPageTeaserFragment } from "@/lib/graphql/generated/fbi/graphql"

type ModalMaterialListItemProps = {
  manifestation: ManifestationSearchPageTeaserFragment
  title: string
  creators?: string
  // Blue title traits (digital lists only): "BLÅ" badge above the title and
  // the blue material-type icon on cost-free titles.
  blueTitle?: boolean
  // Status presentation under the title/author (e.g. a due or pickup label).
  status?: React.ReactNode
  ariaLabel: string
  onSelect: () => void
}

// One row in a modal's material list (loans, reservations): cover with the
// material icon, title, author and status — clicking opens the detail view.
const ModalMaterialListItem = ({
  manifestation,
  title,
  creators,
  blueTitle = false,
  status,
  ariaLabel,
  onSelect,
}: ModalMaterialListItemProps) => {
  const isBlue = useIsBlueTitle(manifestation, blueTitle)

  return (
    <li className="py-8 first:pt-0 last:pb-0 md:py-10">
      <button
        type="button"
        aria-label={ariaLabel}
        onClick={onSelect}
        className="focus-visible flex w-full cursor-pointer items-end gap-6 text-left md:gap-8">
        <div className="w-24 shrink-0 md:w-36">
          <ManifestationCover
            cover={manifestation.cover}
            iconName={getManifestationMaterialTypeIcon(manifestation) || "book"}
            alt={`${title} cover billede`}
            className="w-full"
            costFree={isBlue}
            iconClassName={
              isBlue
                ? "bg-content-blue-100 dark:text-blue-title-dark"
                : "bg-background-overlay-solid"
            }
          />
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            {isBlue && <BlueTitleBadge manifestation={manifestation} />}
            <p className="text-typo-heading-5">{title}</p>
            {creators && (
              <p className="text-typo-subtitle-sm text-foreground-muted">Af {creators}</p>
            )}
          </div>
          {status}
        </div>
      </button>
    </li>
  )
}

export default ModalMaterialListItem
