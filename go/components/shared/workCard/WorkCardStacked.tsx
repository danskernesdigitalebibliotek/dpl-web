import React from "react"

import WorkCard from "@/components/shared/workCard/WorkCard"
import { WorkTeaserSearchPageFragment } from "@/lib/graphql/generated/fbi/graphql"
import { cn } from "@/lib/helpers/helper.cn"
import { WorkId } from "@/lib/types/ids"

type WorkCardStackedProps = {
  works: WorkTeaserSearchPageFragment[]
  materialOrder: WorkId[]
}

const WorkCardStacked = ({ works, materialOrder }: WorkCardStackedProps) => {
  const reversedMaterialOrder = materialOrder.slice().reverse()
  return (
    <div>
      {works
        .slice()
        .reverse()
        .map(work => {
          const stackPositionIndex = materialOrder.indexOf(work.workId as WorkId)
          return (
            <WorkCard
              key={work.workId}
              work={work}
              classNameWrapper="absolute left-0 top-0 h-full w-full"
              className={`${cn("bg-background", { "shadow-stacked-card": stackPositionIndex < 3, "rotate-3":
              stackPositionIndex === 1, "-rotate-3": stackPositionIndex === 2, })}`}
              isHidden={stackPositionIndex !== 0}
              zIndex={reversedMaterialOrder.indexOf(work.workId as WorkId)}
              stackPosition={stackPositionIndex}
            />
          )
        })}
    </div>
  )
}

export default WorkCardStacked
