import React from "react"

import { Badge } from "@/components/shared/badge/Badge"
import { CoverPicture } from "@/components/shared/coverPicture/CoverPicture"
import MaterialTypeIconWrapper from "@/components/shared/workCard/MaterialTypeIconWrapper"
import { cyKeys } from "@/cypress/support/constants"
import { ManifestationSearchPageTeaserFragment } from "@/lib/graphql/generated/fbi/graphql"
import { cn } from "@/lib/helpers/helper.cn"

import Icon from "../icon/Icon"
import type { TWorkCardMaterialType } from "./helper"

export type TWorkCardProps = {
  title: string
  covers: ManifestationSearchPageTeaserFragment["cover"]
  materialTypes: TWorkCardMaterialType[]
  isBlueTitle?: boolean
  ref?: React.Ref<HTMLDivElement>
  className?: string
  isWithTilt?: boolean
}

const WorkCard = ({
  title,
  covers,
  materialTypes,
  isBlueTitle = false,
  ref,
  className,
  isWithTilt = false,
}: TWorkCardProps) => {
  return (
    <div
      ref={ref}
      data-cy={cyKeys["work-card"]}
      className={cn(
        `rounded-base bg-background-overlay relative mb-6 flex aspect-5/7 w-full flex-col
        overflow-hidden px-[15%] pt-[15%]`,
        className
      )}>
      {isBlueTitle && (
        <Badge variant={"blue-title"} className="absolute top-4 left-4 md:top-4 md:left-4">
          BLÅ
        </Badge>
      )}
      <div className="relative mx-auto flex aspect-5/7 h-full w-full">
        <div className="h-full w-full">
          {covers && (
            <CoverPicture
              covers={covers}
              alt={`${title} cover billede`}
              withTilt={isWithTilt}
              className="select-none"
            />
          )}
        </div>
      </div>
      <div className="my-auto flex min-h-[15%] items-center py-3 md:py-4">
        <div className="flex w-full flex-row justify-center gap-2">
          {materialTypes.map(materialType => (
            <MaterialTypeIconWrapper
              key={materialType.iconName}
              costFree={materialType.isCostFree}
              iconName={materialType.iconName}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export const WorkCardSkeleton = () => {
  return (
    <div className="h-full w-full space-y-3 lg:space-y-5">
      <div className="rounded-base bg-background-skeleton w-full animate-pulse">
        <div className="aspect-5/7 px-[15%] pt-[15%]"></div>
      </div>
      <div className="space-y-2">
        <div className="rounded-base bg-background-skeleton h-5 animate-pulse lg:h-7"></div>
        <div className="rounded-base bg-background-skeleton h-3 animate-pulse lg:h-4"></div>
      </div>
    </div>
  )
}

export const WorkCardEmpty = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        `rounded-base bg-background-overlay flex aspect-5/7 h-full w-full flex-col space-y-3
        lg:space-y-5`,
        className
      )}>
      <div className="flex w-full flex-1 flex-col items-center justify-center gap-y-4">
        <Icon
          name="alert"
          className="text-foreground h-[50px] opacity-20 lg:h-[80px]"
          aria-label="Advarsel ikon"
        />
        <p className="text-typo-caption text-center opacity-70">Materialet kunne ikke vises</p>
      </div>
    </div>
  )
}

export default WorkCard
