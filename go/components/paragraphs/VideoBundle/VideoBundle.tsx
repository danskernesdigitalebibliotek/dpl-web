"use client"

import React, { useEffect, useRef, useState } from "react"

import { Button } from "@/components/shared/button/Button"
import Icon from "@/components/shared/icon/Icon"
import Timer from "@/components/shared/timer/Timer"
import WorkCard from "@/components/shared/workCard/WorkCard"
import { useComplexSearchForWorkTeaserQuery } from "@/lib/graphql/generated/fbi/graphql"
import { WorkId } from "@/lib/types/ids"

type VideoBundleAutomatic = {
  cqlSearchString: string
  amountOfMaterials: number
  materials?: never
}

export type VideoBundleMaterial = {
  materialType: string
  workId: WorkId
}

type VideoBundleManual = {
  cqlSearchString?: never
  amountOfMaterials?: never
  materials: VideoBundleMaterial[]
}

export type VideoBundleProps = {
  title: string
  url: string
} & (VideoBundleAutomatic | VideoBundleManual)

const VideoBundle = ({
  title,
  url,
  cqlSearchString,
  amountOfMaterials,
  materials,
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
      cql: cqlSearchString || "",
      offset: 0,
      limit: amountOfMaterials,
      filters: {},
    },
    { enabled: !!cqlSearchString }
  )
  const { data: dataManual, isLoading: isLoadingManual } = useComplexSearchForWorkTeaserQuery(
    {
      cql: materials?.map(material => `workId=${material.workId}`).join(" OR ") || "",
      offset: 0,
      limit: 100,
      filters: {},
    },
    { enabled: !!materials }
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
    <div className="content-container w-full gap-paragraph-spacing-inner bg-background-overlay px-10 py-16 text-center">
      <h2 className="mb-10 block text-typo-heading-2">{title}</h2>
      <div className="flex w-full flex-row items-start">
        <div className="relative aspect-16/9 w-[75%] overflow-hidden rounded-base">
          <iframe
            aria-label={title || "Video"}
            className="absolute inset-0 h-full w-full"
            src={url}
            allowFullScreen
            allow="autoplay; fullscreen"
          />
        </div>
        <div className="flex w-[25%] flex-row flex-wrap justify-center gap-grid-gap pl-4 text-left">
          <div className="relative h-[545px] w-[300px]">
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
          <div className="flex w-full items-center">
            <Timer
              durationInSeconds={10}
              currentItemNumber={currentItemNumber}
              totalItems={materialOrder.length}
              fullCircleAction={moveToNextMaterial}
              setResetTimer={resetFn => (resetTimerRef.current = resetFn)}
              className="ml-2 mr-auto"
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
              className="mx-2">
              <Icon className="h-[24px] w-[24px]" name="arrow-right" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VideoBundle
