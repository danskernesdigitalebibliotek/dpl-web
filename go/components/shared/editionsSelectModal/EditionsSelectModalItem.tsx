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
import { useEqualRowHeight } from "@/hooks/useEqualRowHeights"
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

  // Equalised per row, so the covers above start at the same point.
  const { ref: detailsRef, groupAttribute } = useEqualRowHeight("edition-details")
  // Equalised separately, so a wrapped publisher name keeps the status labels
  // level.
  const { ref: listRef, groupAttribute: listGroupAttribute } =
    useEqualRowHeight<HTMLDListElement>("edition-detail-list")

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
      data-equal-row-item
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
      {/* Hidden here as well: accessibleName already says "Blå titel". */}
      <div aria-hidden="true" className="absolute top-2 mb-3">
        <BlueTitleBadge isBlue={isBlueTitle} />
      </div>
      {/* Takes the card's slack height, so the cover boxes on a row match; the
          cover keeps its proportions and centres in the box. Capped below md,
          where a card spans the full width. The mb leaves room for the
          material-type icon straddling the bottom edge. */}
      <div className="mt-8 mb-6 flex w-full grow items-center justify-center px-[6%]">
        <ManifestationCover
          cover={manifestation.cover}
          iconName={getManifestationMaterialTypeIcon(manifestation) || "book"}
          alt=""
          className="max-h-[280px] w-full md:max-h-full"
          costFree={isBlueTitle}
          iconClassName={
            isBlueTitle
              ? "bg-content-blue-100 dark:text-blue-title-dark"
              : "bg-background-overlay-solid"
          }
        />
      </div>
      {/* Pushed to the card's bottom and grown to the row's tallest block, so
          the titles line up. */}
      <div
        aria-hidden="true"
        ref={detailsRef}
        {...groupAttribute}
        className="mt-auto min-w-0 space-y-4">
        <p className="text-typo-subtitle-lg mt-2 break-words">{title}</p>
        {/* The value sits under its term on a phone, where two columns break
            mid-word in a half-width card, and beside it from sm. */}
        <dl ref={listRef} {...listGroupAttribute} className="space-y-2">
          {details.map(detail => (
            <div
              key={detail.term}
              className="sm:flex sm:items-baseline sm:justify-between sm:gap-4">
              <dt className="text-typo-body-md text-foreground-muted/90">{detail.term}</dt>
              <dd className="text-typo-body-md min-w-0 break-words sm:text-right">
                {detail.value ?? "–"}
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
    {/* The same 2/3 getCoverAspectRatio falls back to for an unmeasured cover. */}
    <div className="relative mt-8 mb-6 aspect-2/3 w-full px-[6%]">
      <CoverPictureSkeleton />
    </div>
    {/* One bar per line of the real card — a title plus three detail rows — at
        the same heights. */}
    <div className="mt-auto space-y-4">
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
