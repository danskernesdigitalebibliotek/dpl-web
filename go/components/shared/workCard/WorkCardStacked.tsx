import React, { ReactNode } from "react"

import { WorkCardProps } from "@/components/shared/workCard/WorkCard"
import { WorkTeaserSearchPageFragment } from "@/lib/graphql/generated/fbi/graphql"
import { cn } from "@/lib/helpers/helper.cn"
import { WorkId } from "@/lib/types/ids"

type WorkCardStackedProps = {
  children: ReactNode
  works: WorkTeaserSearchPageFragment[]
  materialOrder: WorkId[]
}

const WorkCardStacked = ({ children, works, materialOrder }: WorkCardStackedProps) => {
  const reversedMaterialOrder = materialOrder.slice().reverse()
  return (
    <>
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement<WorkCardProps>(child)) {
          const work = works[index]
          const stackPositionIndex = materialOrder.indexOf(work.workId as WorkId)

          return React.cloneElement(child, {
            classNameWrapper: "absolute left-0 top-0 h-full w-full",
            className: `${cn("bg-background", {
              "shadow-stacked-card": stackPositionIndex < 3,
              "rotate-3": stackPositionIndex === 1,
              "-rotate-3": stackPositionIndex === 2,
            })}`,
            isHidden: stackPositionIndex !== 0,
            zIndex: reversedMaterialOrder.indexOf(work.workId as WorkId),
            stackPosition: stackPositionIndex,
          })
        }
      })}
    </>
  )
}

export default WorkCardStacked
