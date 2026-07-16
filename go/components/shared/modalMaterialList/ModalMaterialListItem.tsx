import React from "react"

import { getManifestationMaterialTypeIcon } from "@/components/pages/workPageLayout/helper"
import ManifestationCover from "@/components/shared/manifestationCover/ManifestationCover"
import { ManifestationSearchPageTeaserFragment } from "@/lib/graphql/generated/fbi/graphql"

type ModalMaterialListItemProps = {
  manifestation: ManifestationSearchPageTeaserFragment
  title: string
  creators?: string
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
  status,
  ariaLabel,
  onSelect,
}: ModalMaterialListItemProps) => (
  <li className="py-8 first:pt-0 last:pb-0">
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onSelect}
      className="focus-visible flex w-full cursor-pointer items-end gap-8 text-left">
      <div className="w-28 shrink-0 lg:w-32">
        <ManifestationCover
          cover={manifestation.cover}
          iconName={getManifestationMaterialTypeIcon(manifestation) || "book"}
          alt={`${title} cover billede`}
          className="w-full"
          iconClassName="bg-background-overlay-solid"
        />
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <p className="text-typo-heading-5">{title}</p>
          {creators && <p className="text-typo-subtitle-sm text-foreground-muted">Af {creators}</p>}
        </div>
        {status}
      </div>
    </button>
  </li>
)

export default ModalMaterialListItem
