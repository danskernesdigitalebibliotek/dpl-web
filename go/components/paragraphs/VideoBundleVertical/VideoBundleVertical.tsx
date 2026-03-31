"use client"

import React from "react"

import { Button } from "@/components/shared/button/Button"
import Icon from "@/components/shared/icon/Icon"
import Timer from "@/components/shared/timer/Timer"
import WorkCardStackedWithCaption from "@/components/shared/workCard/WorkCardStackedWithCaption"
import useCarouselMaterialOrder from "@/hooks/useCarouselMaterialOrder"
import type {
  ParagraphGoVideoBundleVerticalManual as VideoBundleVerticalManualType,
} from "@/lib/graphql/generated/dpl-cms/graphql"
import { ComplexSearchForWorkTeaserQuery } from "@/lib/graphql/generated/fbi/graphql"

export type VideoBundleVerticalProps = {
  works?: ComplexSearchForWorkTeaserQuery["complexSearch"]["works"]
  title: VideoBundleVerticalManualType["goVideoTitle"]
  videoUrl: string
}

const VideoBundleVertical = ({ works, title, videoUrl }: VideoBundleVerticalProps) => {
  const { materialOrder, currentItemNumber, resetTimerRef, moveToNextMaterial, moveToPreviousMaterial } =
    useCarouselMaterialOrder(works)

  return (
    <div className="bg-background-overlay">
      <div className="content-container">
        <div className="py-paragraph-spacing w-full text-center">
          <h2 className="text-typo-heading-2 mb-paragraph-spacing">{title}</h2>
          <div className="grid-go items-start">
            <div className="col-span-full flex justify-center lg:col-span-6">
              <div
                className="rounded-base relative aspect-9/16 w-full max-w-[225px] overflow-hidden
                  lg:max-w-none">
                <iframe
                  title={title || "Video"}
                  aria-label={title || "Video"}
                  className="absolute inset-0 h-full w-full"
                  src={videoUrl}
                  allowFullScreen
                  allow="autoplay; fullscreen"
                  loading="lazy"
                />
              </div>
            </div>
            <div
              className="grid-go mt-paragraph-spacing col-span-full items-center
                lg:hidden">
              <div className="col-span-1">
                <Button
                  onClick={moveToPreviousMaterial}
                  variant="icon"
                  ariaLabel="Vis forrige værk"
                  disabled={!works}>
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
                  disabled={!works}>
                  <Icon className="h-[24px] w-[24px]" name="arrow-right" />
                </Button>
              </div>
            </div>
            <div
              className="col-span-full hidden flex-col items-center justify-center text-left
                lg:col-span-5 lg:col-start-8 lg:flex">
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
                      disabled={!works?.length}>
                      <Icon className="h-[24px] w-[24px]" name="arrow-left" />
                    </Button>
                    <Button
                      onClick={moveToNextMaterial}
                      variant="icon"
                      ariaLabel="Vis næste værk"
                      disabled={!works?.length}>
                      <Icon className="h-[24px] w-[24px]" name="arrow-right" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export const VideoBundleVerticalSkeleton = () => {
  return (
    <div className="bg-background-skeleton">
      <div className="content-container">
        <div className="gap-paragraph-spacing-inner w-full py-4 text-center md:py-12 lg:py-16">
          <div
            className="bg-background-skeleton mr-auto mb-4 ml-auto block h-10 w-36 animate-pulse
              rounded-full md:mb-10 lg:w-72"
          />
          <div className="flex w-full flex-col items-start gap-11 lg:flex-row lg:gap-0">
            <div
              className="rounded-base bg-background-skeleton relative aspect-9/16 w-full max-w-sm
                self-center animate-pulse overflow-hidden lg:w-[50%] lg:max-w-none"
            />
            <div
              className="gap-grid-gap flex w-full flex-row flex-wrap items-center justify-center
                lg:w-[50%] lg:justify-end lg:pl-4">
              <div className="md:ml-grid-column-2 mr-auto h-[24px] w-[24px] rounded-full lg:hidden" />
              <div
                className="bg-background-skeleton rounded-base relative aspect-5/7 w-[177px]
                  animate-pulse md:w-[250px]"
              />
              <div className="md:mr-grid-column-2 ml-auto h-[24px] w-[24px] rounded-full lg:hidden" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VideoBundleVertical
