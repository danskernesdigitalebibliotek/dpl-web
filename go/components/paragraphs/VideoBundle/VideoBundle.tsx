"use client"

import React, { useEffect, useRef, useState } from "react"

import { Button } from "@/components/shared/button/Button"
import Icon from "@/components/shared/icon/Icon"
import Timer from "@/components/shared/timer/Timer"
import WorkCardStackedWithCaption from "@/components/shared/workCard/WorkCardStackedWithCaption"
import type {
  ParagraphGoVideoBundleAutomatic as VideoBundleAutomaticType,
  ParagraphGoVideoBundleManual as VideoBundleManualType,
} from "@/lib/graphql/generated/dpl-cms/graphql"
import { ComplexSearchForWorkTeaserQuery } from "@/lib/graphql/generated/fbi/graphql"
import { WorkId } from "@/lib/types/ids"

export type VideoBundleProps = {
  works: ComplexSearchForWorkTeaserQuery["complexSearch"]["works"] | undefined
  title: VideoBundleAutomaticType["goVideoTitle"] | VideoBundleManualType["goVideoTitle"]
  videoUrl: string
}

const VideoBundle = ({ works, title, videoUrl }: VideoBundleProps) => {
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
    <div className="bg-background-overlay">
      <div className="content-container">
        <div className="my-paragraph-spacing w-full text-center">
          <h2 className="text-typo-heading-2 mb-paragraph-spacing">{title}</h2>
          <div className="grid-go items-start">
            <div className="rounded-base relative col-span-full aspect-16/9 overflow-hidden lg:col-span-9 lg:mb-0">
              <iframe
                aria-label={title || "Video"}
                className="absolute inset-0 h-full w-full"
                src={videoUrl}
                allowFullScreen
                allow="autoplay; fullscreen"
              />
            </div>
            <div className="grid-go mt-paragraph-spacing col-span-full items-center lg:col-span-3 lg:hidden">
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
            <div className="col-span-full hidden flex-col items-center justify-center text-left lg:col-span-3 lg:flex">
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

export const VideoBundleSkeleton = () => {
  return (
    <div className="bg-background-skeleton">
      <div className="content-container">
        <div className="gap-paragraph-spacing-inner w-full py-4 text-center md:py-12 lg:py-16">
          <div
            className="bg-background-skeleton mr-auto mb-4 ml-auto block h-10 w-36 animate-pulse rounded-full md:mb-10
              lg:w-72"
          />
          <div className="flex w-full flex-col items-start gap-11 lg:flex-row lg:gap-0">
            <div
              className="rounded-base bg-background-skeleton relative aspect-16/9 w-full animate-pulse overflow-hidden
                lg:w-[75%]"
            />
            <div
              className="gap-grid-gap flex w-full flex-row flex-wrap items-center justify-center lg:w-[25%] lg:justify-end
                lg:pl-4">
              <div className="md:ml-grid-column-2 mr-auto h-[24px] w-[24px] rounded-full lg:hidden" />
              <div
                className="bg-background-skeleton rounded-base relative aspect-4/9 h-[250px] w-[177px] animate-pulse
                  md:aspect-3/5 md:w-[300px] lg:h-[450px]"
              />
              <div className="md:mr-grid-column-2 ml-auto h-[24px] w-[24px] rounded-full lg:hidden" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VideoBundle
