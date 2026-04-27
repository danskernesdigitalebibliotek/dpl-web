import { useEffect, useRef, useState } from "react"

import { Button } from "@/components/shared/button/Button"
import Icon from "@/components/shared/icon/Icon"
import Timer from "@/components/shared/timer/Timer"
import WorkCardStackedWithCaption from "@/components/shared/workCard/WorkCardStackedWithCaption"
import { cyKeys } from "@/cypress/support/constants"
import { ComplexSearchForWorkTeaserQuery } from "@/lib/graphql/generated/fbi/graphql"
import { cn } from "@/lib/helpers/helper.cn"
import { WorkId } from "@/lib/types/ids"

type CarouselSliderProps = {
  works?: ComplexSearchForWorkTeaserQuery["complexSearch"]["works"]
  className?: string
}

const CarouselSlider = ({ works, className }: CarouselSliderProps) => {
  const [materialOrder, setMaterialOrder] = useState<WorkId[]>([])
  const [currentItemNumber, setCurrentItemNumber] = useState<number>(1)
  const resetTimerRef = useRef<
    ((nextItemNumber?: number | ((prev: number) => number)) => void) | null
  >(null)

  const moveToNextMaterial = () => {
    setMaterialOrder(prev => [...prev.slice(1), prev[0]])
    setCurrentItemNumber(prev => (prev === materialOrder.length ? 1 : prev + 1))
    resetTimerRef.current?.(prev => (prev % materialOrder.length) + 1)
  }

  const moveToPreviousMaterial = () => {
    setMaterialOrder(prev => [prev[prev.length - 1], ...prev.slice(0, -1)])
    setCurrentItemNumber(prev => (prev === 1 ? materialOrder.length : prev - 1))
    resetTimerRef.current?.()
  }

  useEffect(() => {
    if (!!works) {
      setMaterialOrder(works.map(work => work.workId as WorkId))
    }
  }, [works])

  return (
    <div
      className={cn("mt-paragraph-spacing col-span-full lg:mt-0", className)}
      data-cy={cyKeys["video-bundle-slider"]}>
      <div className="grid-go lg:pl-grid-gap-half items-center lg:block">
        {/* Mobile: prev button */}
        <div className="col-span-1 flex justify-center lg:hidden">
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
        <div className="col-span-1 flex justify-center lg:hidden">
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
