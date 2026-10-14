"use client"

import React from "react"

import BlueTitleBadge, { useIsBlueTitle } from "@/components/shared/badge/BlueTitleBadge"
import { CoverPicture, CoverPictureSkeleton } from "@/components/shared/coverPicture/CoverPicture"
import Icon from "@/components/shared/icon/Icon"
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
  // `edition` is the plain edition number/name with no year or contributors
  // mixed in, but can come wrapped in parens (e.g. "(1. udgave)").
  const editionLabel = manifestation.edition?.edition?.replace(/^\(|\)$/g, "")
  const title = manifestation.titles?.identifyingAddition || manifestation.titles?.full
  const publisher = manifestation.publisher?.join(", ")
  const pages = manifestation.physicalDescription?.numberOfPages
  const contributors = manifestation.contributors
    .map(contributor => {
      const role = contributor.roles[0]?.function.singular
      return role ? `${contributor.display} (${role})` : contributor.display
    })
    .join(" · ")
  const publisherLine = [publisher, pages ? `${pages} sider` : undefined]
    .filter(Boolean)
    .join(" · ")

  const isBlueTitle = useIsBlueTitle(manifestation)

  const accessibleName = [
    year ? `${year}` : title,
    editionLabel,
    isBlueTitle ? "Blå titel, gratis at låne" : undefined,
    publisherLine,
    contributors,
    unavailableText,
  ]
    .filter(Boolean)
    .join(", ")

  return (
    <label
      className="has-focus-visible:ring-foreground bg-background-overlay
        has-checked:border-foreground rounded-base relative flex cursor-pointer flex-col gap-2
        border-2 border-transparent p-4 transition-[border-color] has-focus-visible:ring-2
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
      {/* The badge sets its own aria-hidden from the lookup; this wrapper's wins
          over it, which is what the card wants — accessibleName already says
          "Blå titel". */}
      <div aria-hidden="true" className="contents">
        <BlueTitleBadge manifestation={manifestation} isBlueOverride={isBlueTitle} />
      </div>
      <div className="relative mx-auto aspect-[2/3] w-[85%] max-w-[150px] sm:max-w-none">
        <CoverPicture
          alt=""
          covers={manifestation.cover}
          sizes="(max-width: 1024px) 120px, 160px"
          withTilt
        />
      </div>
      <div aria-hidden="true" className="min-w-0 space-y-1">
        <p className="text-typo-subtitle-md mt-2 font-semibold break-words">{year ?? title}</p>
        {editionLabel && <p className="text-typo-body-sm break-words">{editionLabel}</p>}
        {contributors && <p className="text-typo-body-sm break-words">{contributors}</p>}
        {publisherLine && <p className="text-typo-body-sm opacity-70">{publisherLine}</p>}
        {unavailableLabel}
      </div>
    </label>
  )
}

// Mirrors the item's geometry so the grid does not shift while loading.
const Skeleton = () => (
  <div className="bg-background-overlay rounded-base flex flex-col gap-2 p-4">
    <div className="relative mx-auto aspect-[2/3] w-[85%]">
      <CoverPictureSkeleton />
    </div>
    <div className="bg-background-skeleton h-3 w-2/3 animate-pulse rounded-sm" />
    <div className="bg-background-skeleton h-3 w-1/2 animate-pulse rounded-sm" />
  </div>
)

EditionsSelectModalItem.Skeleton = Skeleton

export default EditionsSelectModalItem
