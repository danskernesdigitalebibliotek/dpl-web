import { cn } from "@/lib/helpers/helper.cn"

import { Button } from "@/components/shared/button/Button"
import Icon from "@/components/shared/icon/Icon"
import Timer from "@/components/shared/timer/Timer"
import WorkCardStackedWithCaption from "@/components/shared/workCard/WorkCardStackedWithCaption"
import { cyKeys } from "@/cypress/support/constants"
import type { CarouselMaterialOrder } from "@/hooks/useCarouselMaterialOrder"
import { ComplexSearchForWorkTeaserQuery } from "@/lib/graphql/generated/fbi/graphql"

type CarouselSliderProps = {
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

const CarouselSlider = ({
  works,
  currentItemNumber,
  materialOrder,
  moveToNextMaterial,
  moveToPreviousMaterial,
  resetTimerRef,
  className,
}: CarouselSliderProps) => {
  return (
    <div
      className={cn("col-span-full mt-paragraph-spacing lg:mt-0", className)}
      data-cy={cyKeys["video-bundle-slider"]}>
      <div className="grid-go items-center lg:block lg:pl-grid-gap-half">
        {/* Mobile: prev button */}
        <div className="col-span-1 lg:hidden">
          <Button
            onClick={moveToPreviousMaterial}
            variant="icon"
            ariaLabel="Vis forrige værk"
            disabled={!works}
            data-cy={cyKeys["video-bundle-prev-button"]}>
            <Icon className="h-[24px] w-[24px]" name="arrow-left" />
          </Button>
        </div>

        {/* Work card — rendered once, responsive */}
        <div className="col-span-4 lg:relative lg:w-full">
          <WorkCardStackedWithCaption
            currentItemNumber={currentItemNumber}
            works={works || []}
            materialOrder={materialOrder}
          />
        </div>

        {/* Mobile: next button */}
        <div className="col-span-1 lg:hidden">
          <Button
            onClick={moveToNextMaterial}
            variant="icon"
            ariaLabel="Vis næste værk"
            disabled={!works}
            data-cy={cyKeys["video-bundle-next-button"]}>
            <Icon className="h-[24px] w-[24px]" name="arrow-right" />
          </Button>
        </div>

        {/* Desktop: timer + nav buttons */}
        <div className="hidden lg:mt-8 lg:flex lg:items-center">
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

export default CarouselSlider
