"use client"

import React from "react"

import {
  getManifestationMaterialType,
  getManifestationMaterialTypeIcon,
  isAudioMaterialType,
} from "@/components/pages/workPageLayout/helper"
import BlueTitleBadge, { useIsBlueTitle } from "@/components/shared/badge/BlueTitleBadge"
import { CoverPictureSkeleton } from "@/components/shared/coverPicture/CoverPicture"
import Icon from "@/components/shared/icon/Icon"
import ManifestationCover from "@/components/shared/manifestationCover/ManifestationCover"
import { ManifestationWorkPageFragment } from "@/lib/graphql/generated/fbi/graphql"

type EditionsSelectModalItemProps = {
  manifestation: ManifestationWorkPageFragment
  name: string
  checked: boolean
  onSelect: () => void
  // Shown under the caption when the edition cannot be borrowed right now.
  // Physical and digital editions word this differently, so the caller
  // supplies the status.
  unavailableLabel?: React.ReactNode
  unavailableText?: string
}

const EditionsSelectModalItem = ({
  manifestation,
  name,
  checked,
  onSelect,
  unavailableLabel,
  unavailableText,
}: EditionsSelectModalItemProps) => {
  const year = manifestation.edition?.publicationYear?.year
  // The same title the work page's heading shows: the main title, without the
  // subtitles `full` carries.
  const title = manifestation.titles?.main[0]
  const publisher = manifestation.publisher?.join(", ")
  const isAudio = isAudioMaterialType(getManifestationMaterialType(manifestation).code)
  // Audio has no page count, so its running time comes from the free-text
  // summary ("20 t., 44 min."). Print takes the plain page number instead —
  // the same summary would carry illustration notes along with it
  // ("335 sider, ill. i farver").
  const pages = manifestation.physicalDescription?.numberOfPages
  const extent = isAudio
    ? manifestation.physicalDescription?.summaryFull
    : pages && `${pages} sider`

  const details = [
    { term: "Udgave", value: year ? `${year}` : undefined },
    { term: "Forlag", value: publisher },
    { term: isAudio ? "Varighed" : "Sideantal", value: extent },
  ].filter(detail => Boolean(detail.value))

  const isBlueTitle = useIsBlueTitle(manifestation)

  const accessibleName = [
    title,
    isBlueTitle ? "Blå titel, gratis at låne" : undefined,
    ...details.map(detail => `${detail.term}: ${detail.value}`),
    unavailableText,
  ]
    .filter(Boolean)
    .join(", ")

  return (
    <label
      className="has-focus-visible:ring-foreground bg-background-overlay
        has-checked:border-foreground rounded-base relative flex cursor-pointer flex-col border-2
        border-transparent p-4 transition-[border-color] has-focus-visible:ring-2
        has-focus-visible:ring-offset-2">
      <input
        type="radio"
        name={name}
        className="sr-only"
        checked={checked}
        onChange={onSelect}
        aria-label={accessibleName}
      />
      {checked && (
        <span
          aria-hidden="true"
          className="bg-foreground text-background absolute top-3 right-3 flex h-6 w-6 items-center
            justify-center rounded-full">
          <Icon name="check" className="h-4 w-4" />
        </span>
      )}
      {/* The badge sets its own aria-hidden; this wrapper's wins over it, which
          is what the card wants — accessibleName already says "Blå titel". */}
      <div aria-hidden="true" className="absolute top-2 mb-3">
        <BlueTitleBadge isBlue={isBlueTitle} />
      </div>
      {/* The cover box takes its height from its own width, so it scales with
          the column instead of a fixed size. Covers sit on its bottom edge and
          are capped by it, which keeps them on one line across the grid
          whatever their proportions. The bottom inset leaves the material-type
          icon straddling the cover's bottom edge room inside the box. */}
      <div className="relative mt-6 flex aspect-5/7 w-full items-end justify-center px-[6%]">
        <ManifestationCover
          cover={manifestation.cover}
          iconName={getManifestationMaterialTypeIcon(manifestation) || "book"}
          alt=""
          className="absolute inset-x-[6%] bottom-[8%] max-h-[92%]"
          costFree={isBlueTitle}
          iconClassName={
            isBlueTitle
              ? "bg-content-blue-100 dark:text-blue-title-dark"
              : "bg-background-overlay-solid"
          }
        />
      </div>
      {/* Pushed to the card's bottom, so the titles line up across the row
          whatever height the cover above them took. */}
      <div aria-hidden="true" className="min-w-0 items-start space-y-4">
        <p className="text-typo-subtitle-lg mt-2 font-semibold break-words">{title}</p>
        {/* Term and value share a row, the value pushed to the right edge. */}
        <dl className="space-y-2">
          {details.map(detail => (
            <div key={detail.term} className="flex items-baseline justify-between gap-4">
              <dt className="text-typo-body-md opacity-70">{detail.term}</dt>
              <dd className="text-typo-body-md min-w-0 text-right font-semibold break-words">
                {detail.value}
              </dd>
            </div>
          ))}
        </dl>
        {unavailableLabel}
      </div>
    </label>
  )
}

// Mirrors the item's geometry so the grid does not shift while loading.
const Skeleton = () => (
  <div
    className="bg-background-overlay rounded-base flex flex-col gap-2 border-2 border-transparent
      p-4">
    <div className="relative aspect-5/7 w-full px-[6%] pb-5">
      <CoverPictureSkeleton />
    </div>
    {/* One bar per line the real card renders — a title plus the three detail
        rows — at the same heights, so the grid does not jump when the editions
        arrive. */}
    <div className="mt-auto space-y-4 pt-20">
      <div className="bg-background-skeleton h-8 w-2/3 animate-pulse rounded-sm" />
      <div className="space-y-2">
        <div className="bg-background-skeleton h-6 w-full animate-pulse rounded-sm" />
        <div className="bg-background-skeleton h-6 w-full animate-pulse rounded-sm" />
        <div className="bg-background-skeleton h-6 w-full animate-pulse rounded-sm" />
      </div>
    </div>
  </div>
)

EditionsSelectModalItem.Skeleton = Skeleton

export default EditionsSelectModalItem
