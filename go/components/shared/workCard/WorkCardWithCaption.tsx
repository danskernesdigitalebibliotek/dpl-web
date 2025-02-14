import React from "react"

import { cn } from "@/lib/helpers/helper.cn"
import { displayCreators } from "@/lib/helpers/helper.creators"

import WorkCard, { WorkCardProps } from "./WorkCard"

type WorkCardWithCaptionProps = {
  classNameCaption?: string
  classNameWorkCard?: string
} & WorkCardProps

const WorkCardWithCaption = ({
  work,
  classNameCaption,
  classNameWorkCard,
  className,
  isWithTilt,
}: WorkCardWithCaptionProps) => {
  return (
    <div className={cn("block space-y-3 lg:space-y-5", className)}>
      <WorkCard work={work} className={classNameWorkCard} isWithTilt={isWithTilt} />
      <div className={cn("space-y-2", classNameCaption)}>
        <p className="text-typo-subtitle-lg max-h-[72px] overflow-y-auto break-words">
          {work.titles.full[0]}
        </p>
        <p className="text-typo-caption opacity-60">{displayCreators(work.creators, 2)}</p>
      </div>
    </div>
  )
}

export default WorkCardWithCaption
