import Link from "next/link"
import React from "react"

import { WorkCardEmpty } from "@/components/shared/workCard/WorkCard"
import WorkCardContainer from "@/components/shared/workCard/WorkCardContainer"
import { cyKeys } from "@/cypress/support/constants"
import { WorkTeaserSearchPageFragment } from "@/lib/graphql/generated/fbi/graphql"
import { cn } from "@/lib/helpers/helper.cn"
import { displayCreators } from "@/lib/helpers/helper.creators"

import { getWorkTeaserProps } from "./helper"

export type TWorkTeaserProps = {
  work: WorkTeaserSearchPageFragment
  queryParams?: Record<string, number | string>
  className?: string
  captionClassName?: string
  cardClassName?: string
  isWithTilt?: boolean
}

// A work card with title and creators below, linking to the work page.
const WorkTeaser = ({
  work,
  queryParams,
  className,
  captionClassName,
  cardClassName,
  isWithTilt = true,
}: TWorkTeaserProps) => {
  const { title, creators, url, manifestation, manifestations } = getWorkTeaserProps(
    work,
    queryParams
  )

  return (
    <Link
      prefetch={false}
      aria-label={`Tilgå værket ${title} af ${displayCreators(creators, 1)}`}
      className={cn("focus-visible", className)}
      href={url}>
      <div className={cn("block space-y-3 lg:space-y-5", captionClassName)}>
        {manifestation ? (
          <WorkCardContainer
            className={cardClassName}
            title={title}
            covers={manifestation.cover}
            manifestations={manifestations}
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
      </div>
    </Link>
  )
}

export default WorkTeaser
