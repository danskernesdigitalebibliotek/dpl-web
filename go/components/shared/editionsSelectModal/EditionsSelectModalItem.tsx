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
  // Physical and digital editions word it differently, so the caller supplies it.
  unavailableLabel?: React.ReactNode
  // The block holding the label is aria-hidden, so this is the status's only
  // way into the accessible name. Supplied together with the label.
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
  // The main title the work page's heading shows, without the subtitles `full`
  // carries. `main` is empty for some records, hence the fallback.
  const title = manifestation.titles?.main[0] ?? manifestation.titles?.full[0]
  const publisher = manifestation.publisher?.join(", ")
  const isAudio = isAudioMaterialType(getManifestationMaterialType(manifestation).code)
  // Audio has no page count, so its running time comes from the free-text
  // summary ("20 t., 44 min."). Print takes the plain page number, as the
  // summary also carries illustration notes ("335 sider, ill. i farver").
  const pages = manifestation.physicalDescription?.numberOfPages
  const extent = isAudio
    ? manifestation.physicalDescription?.summaryFull
    : pages && `${pages} sider`

  // All three rows on every edition, missing value or not, so the terms stay
  // level across the cards on a row.
  const details = [
    { term: "Udgave", value: year ? `${year}` : undefined },
    { term: "Forlag", value: publisher || undefined },
    { term: isAudio ? "Varighed" : "Sideantal", value: extent || undefined },
  ]

  const isBlueTitle = useIsBlueTitle(manifestation)

  const accessibleName = [
    title,
    isBlueTitle ? "Blå titel, gratis at låne" : undefined,
    // Valueless rows are layout placeholders, so they are left unread.
    ...details
      .filter(detail => Boolean(detail.value))
      .map(detail => `${detail.term}: ${detail.value}`),
    unavailableText,
  ]
    .filter(Boolean)
    .join(", ")

  return (
    <label
      className="has-focus-visible:ring-foreground bg-background-overlay
        has-checked:border-foreground rounded-base relative row-span-4 grid cursor-pointer
        grid-rows-subgrid gap-y-0 border-2 border-transparent p-4 transition-[border-color]
        has-focus-visible:ring-2 has-focus-visible:ring-offset-2">
      {/* Covers the whole card, so focusing it scrolls to the card the reader
          clicked rather than to its top corner, which may be out of view. */}
      <input
        type="radio"
        name={name}
        className="absolute inset-0 cursor-pointer appearance-none opacity-0"
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
      {/* Hidden here as well: accessibleName already says "Blå titel". */}
      <div aria-hidden="true" className="absolute top-2 left-3 mb-3">
        <BlueTitleBadge isBlue={isBlueTitle} />
      </div>
      {/* The cover spans the column and takes its height from that width,
          capped so a tall edition cannot stretch the row. The mb leaves room
          for the material-type icon straddling the bottom edge. */}
      <div className="mt-8 mb-6 flex w-full items-center justify-center px-[6%]">
        <ManifestationCover
          cover={manifestation.cover}
          iconName={getManifestationMaterialTypeIcon(manifestation) || "book"}
          alt=""
          className="xs:max-h-[280px] max-h-[240px] w-full md:max-h-[400px]"
          costFree={isBlueTitle}
          iconClassName={
            isBlueTitle
              ? "bg-content-blue-100 dark:text-blue-title-dark"
              : "bg-background-overlay-solid"
          }
        />
      </div>
      {/* Title, details and status each take a row of the shared subgrid, so
          they line up across the row whatever the neighbours hold. */}
      <p aria-hidden="true" className="text-typo-subtitle-lg mt-4 min-w-0 break-words">
        {title}
      </p>
      {/* The value sits beside its term, right-aligned, with a wider gap from
          xs where the card has the room for it. */}
      <dl aria-hidden="true" className="mt-4 min-w-0 space-y-2">
        {details.map(detail => (
          <div key={detail.term} className="xs:gap-4 flex items-baseline justify-between gap-2">
            <dt className="text-typo-body-md text-foreground-muted/90">{detail.term}</dt>
            <dd className="text-typo-body-md min-w-0 text-right text-balance break-words">
              {detail.value ?? "–"}
            </dd>
          </div>
        ))}
      </dl>
      <div aria-hidden="true" className="min-w-0 pt-4">
        {unavailableLabel}
      </div>
    </label>
  )
}

// Mirrors the item's geometry so the grid does not shift while loading.
const Skeleton = () => (
  <div
    className="bg-background-overlay rounded-base row-span-4 grid grid-rows-subgrid gap-y-0 border-2
      border-transparent p-4">
    {/* The same 2/3 getCoverAspectRatio falls back to for an unmeasured cover. */}
    <div className="relative mt-8 mb-6 aspect-2/3 max-h-[280px] w-full px-[6%] md:max-h-[400px]">
      <CoverPictureSkeleton />
    </div>
    {/* One bar per line of the real card — a title plus three detail rows — at
        the same heights, on the same rows. */}
    <div className="bg-background-skeleton mt-2 h-8 w-2/3 animate-pulse rounded-sm" />
    <div className="mt-4 space-y-2">
      <div className="bg-background-skeleton h-6 w-full animate-pulse rounded-sm" />
      <div className="bg-background-skeleton h-6 w-full animate-pulse rounded-sm" />
      <div className="bg-background-skeleton h-6 w-full animate-pulse rounded-sm" />
    </div>
    <div className="mt-4" />
  </div>
)

EditionsSelectModalItem.Skeleton = Skeleton

export default EditionsSelectModalItem
