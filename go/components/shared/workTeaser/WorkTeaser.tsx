"use client"

import { useInView } from "framer-motion"
import Link from "next/link"
import React, { useRef } from "react"

import WorkCard, { WorkCardEmpty, WorkCardSkeleton } from "@/components/shared/workCard/WorkCard"
import { cyKeys } from "@/cypress/support/constants"
import { useWorkTeaserManifestation } from "@/hooks/useWorkTeaserManifestation"
import {
  ManifestationSearchPageTeaserFragment,
  WorkTeaserSearchPageFragment,
} from "@/lib/graphql/generated/fbi/graphql"
import { cn } from "@/lib/helpers/helper.cn"
import { displayCreators } from "@/lib/helpers/helper.creators"

export type TWorkTeaserProps = {
  title: string
  creators: WorkTeaserSearchPageFragment["creators"]
  url: string
  manifestations: ManifestationSearchPageTeaserFragment[]
  linkedManifestations: ManifestationSearchPageTeaserFragment[]
  className?: string
  captionClassName?: string
  cardClassName?: string
  isWithTilt?: boolean
}

// A work card with title and creators below, linking to `url`. Cover and
// title are the manifestation the work page lands on; `title` is the work's
// own, used when no manifestation is linked.
const WorkTeaser = ({
  title: workTitle,
  creators,
  url,
  manifestations,
  linkedManifestations,
  className,
  captionClassName,
  cardClassName,
  isWithTilt = true,
}: TWorkTeaserProps) => {
  const ref = useRef<HTMLDivElement>(null)
  // Starts the lookup a little before the teaser scrolls into view.
  const isInView = useInView(ref, { once: true, margin: "400px" })
  const { manifestation, materialTypes, isBlueTitle, isWaiting } = useWorkTeaserManifestation({
    manifestations,
    linkedManifestations,
    isEnabled: isInView,
  })

  const title = isWaiting
    ? workTitle
    : (manifestation?.titles.main[0] ?? manifestation?.titles.full[0] ?? workTitle)
  const cover = manifestation?.cover

  // The link and its wrapper stay while waiting: the slider holds on to the
  // slide element, and the wrapper carries the in-view ref.
  return (
    <Link
      prefetch={false}
      aria-label={`Tilgå værket ${title} af ${displayCreators(creators, 1)}`}
      aria-busy={isWaiting}
      className={cn("focus-visible", className)}
      href={url}>
      <div ref={ref} className={cn("block space-y-3 lg:space-y-5", captionClassName)}>
        {isWaiting ? (
          <WorkCardSkeleton />
        ) : (
          <>
            {cover && manifestations.length ? (
              <WorkCard
                className={cardClassName}
                title={title}
                covers={cover}
                materialTypes={materialTypes}
                isBlueTitle={isBlueTitle}
                isWithTilt={isWithTilt}
              />
            ) : (
              <WorkCardEmpty className={cardClassName} />
            )}
            <div className="space-y-2">
              <p className="text-typo-subtitle-lg break-words" data-cy={cyKeys["work-card-title"]}>
                {title}
              </p>
              <p className="text-typo-body-md opacity-70">{displayCreators(creators, 2)}</p>
            </div>
          </>
        )}
      </div>
    </Link>
  )
}

export default WorkTeaser
