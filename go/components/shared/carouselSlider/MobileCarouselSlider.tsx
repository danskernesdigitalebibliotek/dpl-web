import { cn } from "@/lib/helpers/helper.cn"

import { Button } from "@/components/shared/button/Button"
import Icon from "@/components/shared/icon/Icon"
import WorkCardStackedWithCaption from "@/components/shared/workCard/WorkCardStackedWithCaption"
import { cyKeys } from "@/cypress/support/constants"
import type { CarouselMaterialOrder } from "@/hooks/useCarouselMaterialOrder"
import { ComplexSearchForWorkTeaserQuery } from "@/lib/graphql/generated/fbi/graphql"

type MobileCarouselSliderProps = {
  works?: ComplexSearchForWorkTeaserQuery["complexSearch"]["works"]
  className?: string
} & Pick<
  CarouselMaterialOrder,
  "currentItemNumber" | "materialOrder" | "moveToNextMaterial" | "moveToPreviousMaterial"
>

const MobileCarouselSlider = ({
  works,
  currentItemNumber,
  materialOrder,
  moveToNextMaterial,
  moveToPreviousMaterial,
  className,
}: MobileCarouselSliderProps) => {
  return (
    <div
      className={cn("grid-go mt-paragraph-spacing col-span-full items-center lg:hidden", className)}
      data-cy={cyKeys["video-bundle-slider"]}>
      <div className="col-span-1">
        <Button
          onClick={moveToPreviousMaterial}
          variant="icon"
          ariaLabel="Vis forrige værk"
          disabled={!works}
          data-cy={cyKeys["video-bundle-prev-button"]}>
          <Icon className="h-[24px] w-[24px]" name="arrow-left" />
        </Button>
      </div>
      <div className="col-span-4">
        <WorkCardStackedWithCaption
          currentItemNumber={currentItemNumber}
          works={works || []}
          materialOrder={materialOrder}
        />
      </div>
      <div className="col-span-1">
        <Button
          onClick={moveToNextMaterial}
          variant="icon"
          ariaLabel="Vis næste værk"
          disabled={!works}
          data-cy={cyKeys["video-bundle-next-button"]}>
          <Icon className="h-[24px] w-[24px]" name="arrow-right" />
        </Button>
      </div>
    </div>
  )
}

export default MobileCarouselSlider
