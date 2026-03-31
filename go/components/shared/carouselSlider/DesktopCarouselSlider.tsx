import { cn } from "@/lib/helpers/helper.cn"

import { Button } from "@/components/shared/button/Button"
import Icon from "@/components/shared/icon/Icon"
import Timer from "@/components/shared/timer/Timer"
import WorkCardStackedWithCaption from "@/components/shared/workCard/WorkCardStackedWithCaption"
import { cyKeys } from "@/cypress/support/constants"
import type { CarouselMaterialOrder } from "@/hooks/useCarouselMaterialOrder"
import { ComplexSearchForWorkTeaserQuery } from "@/lib/graphql/generated/fbi/graphql"

type DesktopCarouselSliderProps = {
  works?: ComplexSearchForWorkTeaserQuery["complexSearch"]["works"]
  className?: string
} & Pick<
  CarouselMaterialOrder,
  | "currentItemNumber"
  | "materialOrder"
  | "moveToNextMaterial"
  | "moveToPreviousMaterial"
  | "resetTimerRef"
>

const DesktopCarouselSlider = ({
  works,
  currentItemNumber,
  materialOrder,
  moveToNextMaterial,
  moveToPreviousMaterial,
  resetTimerRef,
  className,
}: DesktopCarouselSliderProps) => {
  return (
    <div
      className={cn("col-span-full hidden flex-col items-center justify-center text-left lg:flex", className)}
      data-cy={cyKeys["video-bundle-slider"]}>
      <div className="pl-grid-gap-half flex w-full flex-col gap-y-8">
        <div className="relative w-full">
          <WorkCardStackedWithCaption
            currentItemNumber={currentItemNumber}
            works={works || []}
            materialOrder={materialOrder}
          />
        </div>
        <div className="hidden lg:flex lg:items-center">
          <Timer
            durationInSeconds={5}
            currentItemNumber={currentItemNumber}
            totalItems={materialOrder.length}
            fullCircleAction={moveToNextMaterial}
            setResetTimer={resetFn => (resetTimerRef.current = resetFn)}
            className="mr-auto"
            isStopped={!works?.length}
          />
          <div className="space-x-grid-gap-half">
            <Button
              onClick={moveToPreviousMaterial}
              variant="icon"
              ariaLabel="Vis forrige værk"
              disabled={!works?.length}
              data-cy={cyKeys["video-bundle-prev-button"]}>
              <Icon className="h-[24px] w-[24px]" name="arrow-left" />
            </Button>
            <Button
              onClick={moveToNextMaterial}
              variant="icon"
              ariaLabel="Vis næste værk"
              disabled={!works?.length}
              data-cy={cyKeys["video-bundle-next-button"]}>
              <Icon className="h-[24px] w-[24px]" name="arrow-right" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DesktopCarouselSlider
