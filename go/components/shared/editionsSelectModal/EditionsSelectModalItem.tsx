"use client"

import React from "react"

import BlueTitleBadge from "@/components/shared/badge/BlueTitleBadge"
import { CoverPicture } from "@/components/shared/coverPicture/CoverPicture"
import { ManifestationWorkPageFragment } from "@/lib/graphql/generated/fbi/graphql"

type EditionsSelectModalItemProps = {
  manifestation: ManifestationWorkPageFragment
  name: string
  checked: boolean
  onSelect: () => void
  // Every copy is out on loan. The edition stays pickable — reserving it is
  // how a reader joins the queue — and is only marked, not disabled.
  lentOut?: boolean
}

const EditionsSelectModalItem = ({
  manifestation,
  name,
  checked,
  onSelect,
  lentOut = false,
}: EditionsSelectModalItemProps) => {
  const year = manifestation.edition?.publicationYear?.year
  const title = manifestation.titles?.identifyingAddition || manifestation.titles?.full
  const publisher = manifestation.publisher?.join(", ")
  const language = manifestation.languages?.main?.map(l => l.display).join(", ")

  return (
    <label
      className="group has-focus-visible:ring-foreground flex cursor-pointer flex-col gap-2
        rounded-sm has-focus-visible:ring-2 has-focus-visible:ring-offset-2">
      <input type="radio" name={name} className="sr-only" checked={checked} onChange={onSelect} />
      {/* No dimming: a lent-out edition is still pickable, so it should not
          read as unavailable. The caption carries the status instead. */}
      <div
        className="border-foreground/10 group-has-checked:border-foreground aspect-[2/3] w-full
          overflow-hidden rounded-sm border-2 transition-colors">
        <CoverPicture
          alt={`Forsidebillede på ${title ?? "udgaven"}`}
          covers={manifestation.cover}
          sizes="(max-width: 1024px) 120px, 160px"
        />
      </div>
      <div className="min-w-0">
        <BlueTitleBadge manifestation={manifestation} className="mb-1" />
        <p className="text-typo-caption break-words">
          {[year ?? title, language].filter(Boolean).join(" - ")}
        </p>
        {publisher && <p className="text-typo-caption opacity-70">{publisher}</p>}
        {lentOut && (
          <p className="text-typo-caption text-error-red-300">
            Udlånt lige nu, men du kan stadig reservere bogen
          </p>
        )}
      </div>
    </label>
  )
}

// Mirrors the item's cover box and caption lines so the grid keeps its
// geometry while availability is still loading.
const Skeleton = () => (
  <div className="flex flex-col gap-2">
    <div className="bg-background-skeleton aspect-[2/3] w-full animate-pulse rounded-sm" />
    <div className="bg-background-skeleton h-3 w-2/3 animate-pulse rounded-sm" />
    <div className="bg-background-skeleton h-3 w-1/2 animate-pulse rounded-sm" />
  </div>
)

EditionsSelectModalItem.Skeleton = Skeleton

export default EditionsSelectModalItem
