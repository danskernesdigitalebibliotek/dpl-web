import Link from "next/link"
import React from "react"

import {
  filterManifestationsByEdition,
  filterManifestationsByMaterialType,
  filterMaterialTypes,
  getEbookManifestationOrFallbackManifestation,
  sortManifestationsBySortPriority,
} from "@/components/pages/workPageLayout/helper"
import WorkCard, { WorkCardEmpty } from "@/components/shared/workCard/WorkCard"
import { WorkTeaserSearchPageFragment } from "@/lib/graphql/generated/fbi/graphql"
import { cn } from "@/lib/helpers/helper.cn"
import { displayCreators } from "@/lib/helpers/helper.creators"
import { resolveUrl } from "@/lib/helpers/helper.routes"
import { WorkId } from "@/lib/types/ids"

import WorkCardWithCaption from "./WorkCardWithCaption"

type WorkCardStackedWithCaptionProps = {
  works: WorkTeaserSearchPageFragment[]
  materialOrder: WorkId[]
  currentItemNumber: number
}

const WorkCardStackedWithCaption = ({
  works,
  materialOrder,
  currentItemNumber,
}: WorkCardStackedWithCaptionProps) => {
  // Get the current work based on currentItemNumber
  const currentWork = works[currentItemNumber - 1]

  // Early return if no current work
  if (!currentWork) {
    return null
  }

  const manifestations = sortManifestationsBySortPriority(
    filterManifestationsByEdition(
      filterManifestationsByMaterialType(filterMaterialTypes(currentWork.manifestations.all))
    )
  )

  const manifestation = getEbookManifestationOrFallbackManifestation(
    currentWork.manifestations.bestRepresentation,
    manifestations
  )

  const title = currentWork.titles.full[0]
  const url = manifestation
    ? resolveUrl({
        routeParams: { work: "work", wid: currentWork.workId },
        queryParams: {
          type: manifestation.materialTypes[0].materialTypeGeneral.code,
        },
      })
    : ""

  const zIndex = materialOrder.indexOf(currentWork.workId as WorkId)

  return (
    <div className="relative">
      {[...Array(2)].map((_, index) => (
        <div
          key={index}
          className={cn(
            `rounded-base !dark:bg-background dark:bg-background-overlay-solid absolute top-0
            right-0 left-0 aspect-5/7 w-full`,
            {
              "shadow-stacked-card": index < 3,
              "rotate-3": index === 0,
              "-rotate-3": index === 1,
            }
          )}></div>
      ))}
      <Link
        key={currentWork.workId}
        aria-label={`Tilgå værket ${title} af ${displayCreators(currentWork.creators, 1)}`}
        className="focus-visible block h-full w-full space-y-3 lg:space-y-5"
        href={url}
        style={{ zIndex }}
        prefetch={false}>
        <WorkCardWithCaption
          creators={currentWork.creators || []}
          title={title}
          className="pointer-events-auto relative h-auto overflow-visible opacity-100">
          {manifestation ? (
            <WorkCard
              className={cn("bg-background dark:bg-background-overlay-solid shadow-stacked-card")}
              workId={currentWork.workId}
              title={title}
              bestRepresentation={manifestation}
              manifestations={manifestations}
            />
          ) : (
            <WorkCardEmpty
              className={cn("bg-background dark:bg-background-overlay-solid shadow-stacked-card")}
            />
          )}
        </WorkCardWithCaption>
      </Link>
    </div>
  )
}

export default WorkCardStackedWithCaption
