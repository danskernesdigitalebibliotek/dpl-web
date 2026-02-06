import React from "react"

import { cyKeys } from "@/cypress/support/constants"
import { WorkFullWorkPageFragment } from "@/lib/graphql/generated/fbi/graphql"
import { cn } from "@/lib/helpers/helper.cn"
import { displayCreators } from "@/lib/helpers/helper.creators"

type WorkCardWithCaptionProps = {
  title: string
  creators: WorkFullWorkPageFragment["creators"]
  className?: string
  children?: React.ReactNode
}

const WorkCardWithCaption = ({
  title,
  creators,
  className,
  children,
}: WorkCardWithCaptionProps) => {
  return (
    <div className={cn("block space-y-3 lg:space-y-5", className)}>
      {children}
      <div className={cn("space-y-2")}>
        <p className="text-typo-subtitle-lg break-words" data-cy={cyKeys["work-card-title"]}>
          {title}
        </p>
        <p className="text-typo-caption opacity-60">{displayCreators(creators, 2)}</p>
      </div>
    </div>
  )
}

export default WorkCardWithCaption
