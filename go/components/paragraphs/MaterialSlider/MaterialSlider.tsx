"use client"

import { useWindowSize } from "@uidotdev/usehooks"
import "keen-slider/keen-slider.min.css"
import { KeenSliderOptions, KeenSliderPlugin, useKeenSlider } from "keen-slider/react"
import Link from "next/link"
import React, { useEffect, useState } from "react"

import { Button } from "@/components/shared/button/Button"
import Icon from "@/components/shared/icon/Icon"
import WorkCard, { WorkCardEmpty, WorkCardSkeleton } from "@/components/shared/workCard/WorkCard"
import WorkCardWithCaption from "@/components/shared/workCard/WorkCardWithCaption"
import {
  ParagraphGoMaterialSliderAutomatic,
  ParagraphGoMaterialSliderManual,
} from "@/lib/graphql/generated/dpl-cms/graphql"
import { ComplexSearchForWorkTeaserQuery } from "@/lib/graphql/generated/fbi/graphql"
import { displayCreators } from "@/lib/helpers/helper.creators"
import { resolveUrl } from "@/lib/helpers/helper.routes"

type MaterialSliderProps = {
  works: ComplexSearchForWorkTeaserQuery["complexSearch"]["works"] | undefined
  title: ParagraphGoMaterialSliderAutomatic["title"] | ParagraphGoMaterialSliderManual["title"]
}

const defaultSliderOptions: KeenSliderOptions = {
  initial: 0,
  slides: {
    origin: "auto",
    spacing: 12,
    perView: 1.1,
  },
  breakpoints: {
    "(min-width: 768px)": {
      slides: {
        origin: "auto",
        spacing: 12,
        perView: () => {
          return 2.1
        },
      },
    },
    "(min-width: 1024px)": {
      slides: {
        spacing: 24,
        perView: () => {
          return 3
        },
      },
    },
  },
}

const WheelControls: KeenSliderPlugin = slider => {
  let touchTimeout: ReturnType<typeof setTimeout>
  let position: {
    x: number
    y: number
  }
  let wheelActive: boolean

  function dispatch(e: WheelEvent, name: string) {
    position.x -= e.deltaX
    position.y -= e.deltaY
    slider.container.dispatchEvent(
      new CustomEvent(name, {
        detail: {
          x: position.x,
          y: position.y,
        },
      })
    )
  }

  function wheelStart(e: WheelEvent) {
    position = {
      x: e.pageX,
      y: e.pageY,
    }
    dispatch(e, "ksDragStart")
  }

  function wheel(e: WheelEvent) {
    dispatch(e, "ksDrag")
  }

  function wheelEnd(e: WheelEvent) {
    dispatch(e, "ksDragEnd")
  }

  function eventWheel(e: WheelEvent) {
    if (e.deltaX === 0) {
      return
    }

    e.preventDefault()
    if (!wheelActive) {
      wheelStart(e)
      wheelActive = true
    }
    wheel(e)
    clearTimeout(touchTimeout)
    touchTimeout = setTimeout(() => {
      wheelActive = false
      wheelEnd(e)
    }, 50)
  }

  slider.on("created", () => {
    slider.container.addEventListener("wheel", eventWheel, {
      passive: false,
    })
  })
}

const MaterialSliderNew = ({ works, title }: MaterialSliderProps) => {
  const [sliderRef, internalSlider] = useKeenSlider(defaultSliderOptions, [WheelControls])
  const [reachedStart, setReachStart] = useState(true)
  const [reachedEnd, setReachEnd] = useState(true)
  const size = useWindowSize()

  useEffect(() => {
    updateSlidePosition()

    internalSlider.current?.on("slideChanged", () => {
      updateSlidePosition()
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // If window size or children amount changes, update the slider
  useEffect(() => {
    internalSlider.current?.update()
  }, [size.width, internalSlider])

  const updateSlidePosition = () => {
    setReachStart(internalSlider.current?.track?.details?.rel === 0)
    setReachEnd(
      internalSlider.current?.track?.details?.maxIdx === internalSlider.current?.track?.details?.rel
    )
  }

  const onLeftClick = () => {
    internalSlider.current?.prev()
  }

  const onRightClick = () => {
    internalSlider.current?.next()
  }

  return (
    <div className="bg-background-overlay overflow-hidden">
      <div className="content-container grid-go">
        <div className="pt-paragraph-spacing col-span-full flex items-center justify-between">
          <h2 className="text-typo-heading-2">{title}</h2>
          <div className="flex flex-row justify-end gap-x-4">
            <Button
              disabled={reachedStart}
              variant="icon"
              ariaLabel="Vis forrige værker"
              onClick={() => onLeftClick()}>
              <Icon className="h-[24px] w-[24px]" name="arrow-left" />
            </Button>
            <Button
              disabled={reachedEnd}
              variant="icon"
              ariaLabel="Vis næste værker"
              onClick={() => onRightClick()}>
              <Icon className="h-[24px] w-[24px]" name="arrow-right" />
            </Button>
          </div>
        </div>

        <div className="-mx-grid-edge px-grid-edge col-span-full">
          <div className="my-paragraph-spacing">
            <div ref={sliderRef} className={"keen-slider !overflow-visible"}>
              {works ? (
                works.map(work => (
                  <Link
                    key={work.workId}
                    aria-label={`Tilgå værket ${work.titles.full[0]} af ${displayCreators(work.creators, 1)}`}
                    className="keen-slider__slide focus-visible outline-accent-foreground focus:outline-offset-2"
                    href={resolveUrl({
                      routeParams: { work: "work", wid: work.workId },
                      queryParams: {
                        type: work.manifestations.bestRepresentation.materialTypes[0]
                          .materialTypeGeneral.code,
                      },
                    })}>
                    <WorkCardWithCaption title={work.titles.full[0]} creators={work.creators || []}>
                      <WorkCard
                        className="dark:bg-background-overlay bg-background"
                        work={work}
                        isWithTilt={true}
                      />
                    </WorkCardWithCaption>
                  </Link>
                ))
              ) : (
                <div className="">
                  <WorkCardEmpty />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export const MaterialSliderSkeleton = () => {
  return (
    <div className="bg-background-overlay overflow-hidden">
      <div className="content-container gap-paragraph-spacing py-paragraph-spacing flex flex-col">
        <div className="flex items-center justify-between">
          <h2 className="text-typo-heading-3 bg-background-skeleton h-11 w-[50%] animate-pulse rounded-full" />
          <div className="flex gap-x-4">
            <div className="bg-background-skeleton h-[40px] w-[40px] animate-pulse rounded-full" />
            <div className="bg-background-skeleton h-[40px] w-[40px] animate-pulse rounded-full" />
          </div>
        </div>
        <div className="grid-go flex flex-row">
          <div className="col-span-full min-w-[calc(90%+6px)] md:min-w-[calc(100%/2-28px)] lg:min-w-[calc(100%/3-16px)]">
            <WorkCardSkeleton />
          </div>
          <div className="col-span-full block min-w-[calc(90%+6px)] md:min-w-[calc(100%/2-28px)] lg:min-w-[calc(100%/3-16px)]">
            <WorkCardSkeleton />
          </div>
          <div
            className="col-span-full hidden w-full md:col-span-2 md:block md:min-w-[calc(100%/2-28px)]
              lg:min-w-[calc(100%/3-16px)]">
            <WorkCardSkeleton />
          </div>
        </div>
      </div>
    </div>
  )
}

export default MaterialSliderNew
