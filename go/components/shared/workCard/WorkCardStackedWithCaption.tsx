import Link from "next/link"
import React from "react"

import { WorkCardEmpty } from "@/components/shared/workCard/WorkCard"
import { WorkTeaserSearchPageFragment } from "@/lib/graphql/generated/fbi/graphql"
import { cn } from "@/lib/helpers/helper.cn"
import { resolveUrl } from "@/lib/helpers/helper.routes"
import { WorkId } from "@/lib/types/ids"

import WorkCardWithCaption from "./WorkCardWithCaption"

type WorkCardStackedWithCaptionProps = {
  works: WorkTeaserSearchPageFragment[]
  materialOrder: WorkId[]
}

const WorkCardStackedWithCaption = ({ works, materialOrder }: WorkCardStackedWithCaptionProps) => {
  if (works.length === 0) return <WorkCardEmpty />

  return (
    <div>
      {works.map(work => {
        const stackPositionIndex = materialOrder
          .slice()
          .reverse()
          .indexOf(work.workId as WorkId)
        const bestRepresentation = work.manifestations.bestRepresentation
        const zIndex = materialOrder.indexOf(work.workId as WorkId)
        return (
          <Link
            key={work.workId}
            className="absolute top-0 left-0 block h-full w-full space-y-3 lg:space-y-5"
            href={resolveUrl({
              routeParams: { work: "work", wid: work.workId },
              queryParams: {
                type: bestRepresentation.materialTypes[0].materialTypeGeneral.code,
              },
            })}
            aria-hidden={stackPositionIndex !== 0}
            tabIndex={stackPositionIndex ? -1 : 0}
            style={{ zIndex }}>
            <WorkCardWithCaption
              work={work}
              classNameCaption={cn({ hidden: stackPositionIndex && stackPositionIndex !== 0 })}
              classNameWorkCard={`${cn("bg-background", {
                "shadow-stacked-card": stackPositionIndex < 3,
                "rotate-3": stackPositionIndex === 1,
                "-rotate-3": stackPositionIndex === 2,
              })}`}
            />
          </Link>
        )
      })}
    </div>
  )
}

export default WorkCardStackedWithCaption
