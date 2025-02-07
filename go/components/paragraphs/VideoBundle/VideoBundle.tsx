"use client"

import React, { useEffect, useRef, useState } from "react"

import { Button } from "@/components/shared/button/Button"
import Icon from "@/components/shared/icon/Icon"
import Timer from "@/components/shared/timer/Timer"
import WorkCard from "@/components/shared/workCard/WorkCard"
import type {
  MediaVideotool,
  ParagraphGoVideoBundleAutomatic as VideoBundleAutomaticType,
  ParagraphGoVideoBundleManual as VideoBundleManualType,
} from "@/lib/graphql/generated/dpl-cms/graphql"
import { useComplexSearchForWorkTeaserQuery } from "@/lib/graphql/generated/fbi/graphql"
import { WorkId } from "@/lib/types/ids"

type VideoBundleAutomatic = {
  cqlSearch: VideoBundleAutomaticType["cqlSearch"]
  videoAmountOfMaterials: VideoBundleAutomaticType["videoAmountOfMaterials"]
  videoBundleWorkIds?: never
}

type VideoBundleManual = {
  cqlSearch?: never
  videoAmountOfMaterials?: never
  videoBundleWorkIds: VideoBundleManualType["videoBundleWorkIds"]
}

export type VideoBundleProps = {
  title: VideoBundleAutomaticType["goVideoTitle"] | VideoBundleManualType["goVideoTitle"]
  embedVideo: {
    mediaVideotool: MediaVideotool["mediaVideotool"]
    name: MediaVideotool["name"]
  }
} & (VideoBundleAutomatic | VideoBundleManual)

const VideoBundle = ({
  title,
  embedVideo,
  cqlSearch,
  videoAmountOfMaterials,
  videoBundleWorkIds,
}: VideoBundleProps) => {
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

  const { data: dataAutomatic, isLoading: isLoadingAutomatic } = useComplexSearchForWorkTeaserQuery(
    {
      cql: cqlSearch?.value || "",
      offset: 0,
      limit: videoAmountOfMaterials,
      filters: {},
    },
    { enabled: !!cqlSearch }
  )
  const { data: dataManual, isLoading: isLoadingManual } = useComplexSearchForWorkTeaserQuery(
    {
      cql: videoBundleWorkIds?.map(material => `workId=${material.work_id}`).join(" OR ") || "",
      offset: 0,
      limit: 100,
      filters: {},
    },
    { enabled: !!videoBundleWorkIds }
  )

  useEffect(() => {
    if (!!dataAutomatic) {
      setMaterialOrder(dataAutomatic.complexSearch.works.map(work => work.workId as WorkId))
    }
    if (!!dataManual) {
      setMaterialOrder(dataManual.complexSearch.works.map(material => material.workId as WorkId))
    }
  }, [dataAutomatic, dataManual])

  if (isLoadingAutomatic || isLoadingManual) {
    return <div>Loading...</div>
  }

  if (
    !isLoadingAutomatic &&
    !dataAutomatic?.complexSearch?.hitcount &&
    !isLoadingManual &&
    !dataManual?.complexSearch?.hitcount
  ) {
    return <div>No data</div>
  }

  return (
    <div className="bg-background-overlay">
      <div className="content-container">
        <div className="w-full gap-paragraph-spacing-inner py-4 text-center md:py-12 lg:py-16">
          <h2 className="mb-4 block text-typo-heading-2 md:mb-10 lg:text-typo-heading-1">
            {title}
          </h2>
          <div className="flex w-full flex-col items-start gap-11 lg:flex-row lg:gap-0">
            <div className="relative aspect-16/9 w-full overflow-hidden rounded-base lg:w-[75%]">
              <iframe
                aria-label={title || "Video"}
                className="absolute inset-0 h-full w-full"
                src={embedVideo.mediaVideotool}
                allowFullScreen
                allow="autoplay; fullscreen"
              />
            </div>
            <div
              className="flex w-full flex-row flex-wrap items-center justify-center gap-grid-gap text-left lg:w-[25%]
                lg:justify-end lg:pl-4">
              <Button
                onClick={moveToPreviousMaterial}
                variant="icon"
                ariaLabel="Vis forrige værk"
                className="mr-auto md:ml-grid-column-2 lg:hidden">
                <Icon className="h-[24px] w-[24px]" name="arrow-left" />
              </Button>
              <div className="md:aspect-3/5 relative aspect-4/9 w-[177px] md:w-[300px] lg:aspect-1/2 xl:aspect-8/15">
                {!!dataAutomatic
                  ? dataAutomatic.complexSearch.works
                      .slice()
                      .reverse()
                      .map(work => (
                        <WorkCard
                          key={work.workId}
                          work={work}
                          isStacked
                          zIndex={
                            materialOrder
                              .slice()
                              .reverse()
                              .indexOf(work.workId as WorkId) * 10
                          }
                          orderNumber={materialOrder.indexOf(work.workId as WorkId)}
                        />
                      ))
                  : dataManual?.complexSearch.works
                      .slice()
                      .reverse()
                      .map(work => (
                        <WorkCard
                          key={work.workId}
                          work={work}
                          isStacked
                          zIndex={
                            materialOrder
                              .slice()
                              .reverse()
                              .indexOf(work.workId as WorkId) * 10
                          }
                          orderNumber={materialOrder.indexOf(work.workId as WorkId)}
                        />
                      ))}
              </div>
              <Button
                onClick={moveToNextMaterial}
                variant="icon"
                ariaLabel="Vis næste værk"
                className="ml-auto md:mr-grid-column-2 lg:hidden">
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
                />
                <Button
                  onClick={moveToPreviousMaterial}
                  variant="icon"
                  ariaLabel="Vis forrige værk"
                  className="">
                  <Icon className="h-[24px] w-[24px]" name="arrow-left" />
                </Button>
                <Button
                  onClick={moveToNextMaterial}
                  variant="icon"
                  ariaLabel="Vis næste værk"
                  className="ml-2">
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

export default VideoBundle
