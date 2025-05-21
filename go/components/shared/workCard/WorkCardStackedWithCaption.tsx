import Link from "next/link"
import React from "react"

import {
  filterManifestationsByEdition,
  filterManifestationsByMaterialType,
  filterMaterialTypes,
  getBestRepresentationOrFallbackManifestation,
  sortManifestationsBySortPriority,
} from "@/components/pages/workPageLayout/helper"
import WorkCard, { WorkCardEmpty } from "@/components/shared/workCard/WorkCard"
import {
  ManifestationWorkPageFragment,
  WorkTeaserSearchPageFragment,
} from "@/lib/graphql/generated/fbi/graphql"
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
  return (
    <div className="relative">
      {[...Array(2)].map((_, index) => (
        <div
          key={index}
          className={cn(
            `rounded-base !dark:bg-background dark:bg-background-overlay-solid absolute top-0 right-0 left-0
            aspect-5/7 w-full`,
            {
              "shadow-stacked-card": index < 3,
              "rotate-3": index === 0,
              "-rotate-3": index === 1,
            }
          )}></div>
      ))}
      {works.map((work, index) => {
        const manifestations = sortManifestationsBySortPriority(
          filterManifestationsByEdition(
            filterManifestationsByMaterialType(
              filterMaterialTypes(work.manifestations.all as ManifestationWorkPageFragment[])
            )
          )
        )
        const bestRepresentation = getBestRepresentationOrFallbackManifestation(
          work.manifestations.bestRepresentation as ManifestationWorkPageFragment,
          manifestations
        )
        const title = work.titles.full[0]
        const url = bestRepresentation
          ? resolveUrl({
              routeParams: { work: "work", wid: work.workId },
              queryParams: {
                type: bestRepresentation.materialTypes[0].materialTypeGeneral.code,
              },
            })
          : ""

        const zIndex = materialOrder.indexOf(work.workId as WorkId)
        return (
          <Link
            key={work.workId}
            aria-label={`Tilgå værket ${title} af ${displayCreators(work.creators, 1)}`}
            className="focus-visible block h-full w-full space-y-3 lg:space-y-5"
            href={url}
            aria-hidden={currentItemNumber - 1 !== index}
            tabIndex={currentItemNumber - 1 !== index ? -1 : undefined}
            style={{ zIndex }}>
            <WorkCardWithCaption
              creators={work.creators || []}
              title={title}
              className={cn(
                "relative",
                currentItemNumber - 1 === index
                  ? "pointer-events-auto h-auto overflow-visible opacity-100"
                  : "pointer-events-none h-0 overflow-hidden opacity-0"
              )}>
              {bestRepresentation ? (
                <WorkCard
                  className={cn(
                    "bg-background dark:bg-background-overlay-solid shadow-stacked-card"
                  )}
                  workId={work.workId}
                  title={title}
                  bestRepresentation={bestRepresentation}
                  manifestations={manifestations}
                  isWithTilt
                />
              ) : (
                <WorkCardEmpty
                  className={cn(
                    "bg-background dark:bg-background-overlay-solid shadow-stacked-card"
                  )}
                />
              )}
            </WorkCardWithCaption>
          </Link>
        )
      })}
    </div>
  )
}

export default WorkCardStackedWithCaption
