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
        <div className="w-full py-4 text-center md:py-12 lg:py-16">
          <h2 className="text-typo-heading-1 lg:text-typo-heading-1 mb-4 block md:mb-10">
            {title}
          </h2>
          <div className="grid-go col-span-full items-start">
            <div className="rounded-base relative col-span-full mb-11 aspect-16/9 overflow-hidden lg:col-span-9 lg:mb-0">
              <iframe
                aria-label={title || "Video"}
                className="absolute inset-0 h-full w-full"
                src={videoUrl}
                allowFullScreen
                allow="autoplay; fullscreen"
              />
            </div>
            <div
              className="gap-grid-gap col-span-full flex flex-row flex-wrap items-center justify-center text-left
                lg:col-span-3 lg:justify-end lg:pl-4">
              <Button
                onClick={moveToPreviousMaterial}
                variant="icon"
                ariaLabel="Vis forrige værk"
                className="md:ml-grid-column-2 mr-auto lg:hidden"
                disabled={!works}>
                <Icon className="h-[24px] w-[24px]" name="arrow-left" />
              </Button>
              <div className="relative aspect-4/9 w-[177px] md:aspect-3/5 md:w-[300px] lg:aspect-1/2 xl:aspect-8/15">
                <WorkCardStackedWithCaption works={works || []} materialOrder={materialOrder} />
              </div>
              <Button
                onClick={moveToNextMaterial}
                variant="icon"
                ariaLabel="Vis næste værk"
                className="md:mr-grid-column-2 ml-auto lg:hidden"
                disabled={!works}>
                <Icon className="h-[24px] w-[24px]" name="arrow-right" />
              </Button>
              <div className="hidden lg:flex lg:w-[300px] lg:items-center">
                <Timer
                  durationInSeconds={10}
                  currentItemNumber={currentItemNumber}
                  totalItems={materialOrder.length}
                  fullCircleAction={moveToNextMaterial}
                  setResetTimer={resetFn => (resetTimerRef.current = resetFn)}
                  className="mr-auto"
                  isStopped={!works?.length}
                />
                <Button
                  onClick={moveToPreviousMaterial}
                  variant="icon"
                  ariaLabel="Vis forrige værk"
                  className=""
                  disabled={!works?.length}>
                  <Icon className="h-[24px] w-[24px]" name="arrow-left" />
                </Button>
                <Button
                  onClick={moveToNextMaterial}
                  variant="icon"
                  ariaLabel="Vis næste værk"
                  className="ml-2"
                  disabled={!works?.length}>
                  <Icon className="h-[24px] w-[24px]" name="arrow-right" />
                </Button>
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
